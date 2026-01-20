'use client';

import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmployeeWithNotes, Role, Team } from '@/db/types';
import { useState } from 'react';
import { toast } from 'sonner';
import { Slider } from './ui/slider';

type EmployeeToBackend = Omit<EmployeeWithNotes, 'id' | 'sortIndex'>;

function AddEmployeeForm({
  onEmployeeAdded,
  onClose,
  teams,
  roles,
}: {
  onEmployeeAdded: (employee: EmployeeWithNotes) => void;
  onClose: () => void;
  teams: Team[];
  roles: Role[];
}) {
  const [fte, setFte] = useState<number>(1.0);
  const [roleId, setRoleId] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');
  const roleMap = new Map(roles.map((role) => [role.id, role.name]));

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const roleName = roleMap.get(roleId);
        const newEmployee: EmployeeToBackend = {
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
          fte: fte,
          role: { id: roleId, name: roleName as string },
          roleId: roleId,
          teamId: teamId,
          notes: [],
        };

        try {
          const res = await fetch('/api/employees/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEmployee),
          });

          if (res.ok) {
            const resEmployee: EmployeeWithNotes = await res.json();
            if (!resEmployee || !resEmployee.teamId) return;
            console.warn('resemp!!', resEmployee);
            const validEmployee = {
              ...resEmployee,
              teamId: resEmployee.teamId,
            };
            onEmployeeAdded(validEmployee);
            onClose();
            toast.success('Employee added succesfully'); //improve later
          }
        } catch (error) {
          console.error('Failed to persist:', error);
          toast.error('Failed to save new employee');
        }
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-3">
        <Label htmlFor="firstName">First name</Label>
        <Input id="firstName" type="text" required name="firstName" />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="lastName">Last name</Label>
        <Input id="lastName" type="text" required name="lastName" />
      </div>
      <Label htmlFor="fte">FTE</Label>
      <div className="flex justify-between gap-6 items-center">
        <Slider defaultValue={[fte]} max={1} step={0.1} onValueChange={(val) => setFte(val[0])} />
        <span className="text-sm text-muted-foreground">{fte.toFixed(1)}</span>
        <input type="number" name="fte" value={fte} hidden readOnly />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select value={roleId} onValueChange={setRoleId} required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Roles</SelectLabel>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <input type="hidden" name="roleId" value={roleId ?? ''} />
        <Select value={teamId} onValueChange={setTeamId} required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a team" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Teams</SelectLabel>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <input type="hidden" name="teamId" value={teamId ?? ''} />
      </div>

      <DialogFooter className="mt-2">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={!roleId || !teamId}>
          Save changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export default AddEmployeeForm;
