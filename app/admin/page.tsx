import { Button } from '@/components/ui/button';
import UsersTable from '@/components/users-table';

async function Admin() {
  return (
    <div className="min-h-screen">
      <section id="table-section" className="py-4 max-w-lg mx-auto gap-4">
        <div id="table-container" className="flex flex-col items-center justify-center">
          <div
            id="button-row"
            className="w-full flex flex-wrap items-center gap-2 md:flex-row justify-end"
          >
            <Button size="sm" variant="outline">
              Add User
            </Button>
          </div>
          <UsersTable />
        </div>
      </section>
    </div>
  );
}

export default Admin;
