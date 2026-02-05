import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

async function Admin() {
  const users = await auth.api.listUsers({
    query: {},
    headers: await headers(),
  });

  console.log(users);

  return (
    <>
      <h1>hallo</h1>
      {users && users.users.map((user) => <p key={user.id}>{user.name}</p>)}
    </>
  );
}

export default Admin;
