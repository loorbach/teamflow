'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AddUserDialog } from './add-user-dialog';
import { Button } from './ui/button';

function AdminControlBar() {
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);

  return (
    <>
      <div className="flex justify-end items-center">
        <Button variant="outline" size="sm" onClick={() => setOpenAddUserDialog(true)}>
          <Plus />
          Add User
        </Button>
      </div>

      <AddUserDialog open={openAddUserDialog} onOpenChange={setOpenAddUserDialog} />
    </>
  );
}

export default AdminControlBar;
