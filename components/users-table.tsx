import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import UserActionsMenu from './user-actions-menu';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
async function UsersTable() {
  const users = await auth.api.listUsers({
    query: {},
    headers: await headers(),
  });
  console.log(users);

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
        {users.users &&
          users?.users.map((user) => {
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
