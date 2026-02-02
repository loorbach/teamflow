import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

async function UsersTable() {
  const users = await auth.api.listUsers({
    query: {},
    headers: await headers(),
  });
  console.log(users.users);

  return (
    <Table>
      <TableCaption>A list of users in the database.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Name</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell className="text-right">{user.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default UsersTable;
