import Header from '@/components/header';
import Table from '@/components/users-table';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function Admin() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <>
      <Header />
      <div className="max-w-lg m-auto py-4 flex flex-col gap-2">
        <Table />
      </div>
    </>
  );
}

export default Admin;
