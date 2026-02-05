import { EmployeeWithNotes, Role, Team } from '@/db/types';
import { useState } from 'react';
import { AddEmployeeDialog } from './add-employee-dialog';
import { Button } from './ui/button';

type Props = {
  onEmployeeAdded: (employee: EmployeeWithNotes) => void;
  teams: Team[];
  roles: Role[];
};

function ControlBar({ onEmployeeAdded, teams, roles }: Props) {
  const [openAddEmployeeDialog, setOpenAddEmployeeDialog] = useState(false);

  return (
    <>
      <div className="flex py-2 px-4 justify-end">
        <Button variant="outline" size="sm" onClick={() => setOpenAddEmployeeDialog(true)}>
          Add employee
        </Button>
      </div>

      <AddEmployeeDialog
        open={openAddEmployeeDialog}
        onOpenChange={setOpenAddEmployeeDialog}
        onEmployeeAdded={onEmployeeAdded}
        teams={teams}
        roles={roles}
      />
    </>
  );
}

export default ControlBar;
