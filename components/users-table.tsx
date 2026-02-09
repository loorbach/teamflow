import { auth } from '@/lib/auth';
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

async function UsersTable() {
  const users = await auth.api.listUsers({
    query: {},
    headers: await headers(),
  });

  // console.log(users);

  return (
    <Table>
      <TableCaption>A list of users.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">User ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-right">Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users &&
          users.users.map((user) => {
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id.slice(0, 5)}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-right">{user.role}</TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}

export default UsersTable;
