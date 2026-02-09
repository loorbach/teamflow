import Header from '@/components/header';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function Admin() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    redirect('/login');
  }

  const users = await auth.api.listUsers({
    query: {},
    headers: await headers(),
  });

  console.log(users);

  return (
    <>
      <Header />
      {users && users.users.map((user) => <p key={user.id}>{user.name}</p>)}
    </>
  );
}

export default Admin;
