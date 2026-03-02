'use server';

import { db } from '@/db/client';
import { user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import UserActionsMenu from './user-actions-menu';

async function UsersTable() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user || !session.user.organization_id) return;

  const userData = await db
    .select()
    .from(user)
    .where(eq(user.organization_id, session?.user.organization_id));

  console.log(userData);

  return (
    <Table>
      <TableCaption>A list of all Teamflow users.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">User ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userData &&
          userData.map((user) => {
            if (!user.id || !user.role) return;
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id.slice(0, 5)}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="text-right">
                  <UserActionsMenu userId={user.id} userName={user.name} currentRole={user.role} />
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}

export default UsersTable;
