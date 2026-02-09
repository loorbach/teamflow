'use client';

import { MoreHorizontalIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Spinner } from './ui/spinner';

interface UserActionsMenuProps {
  userId: string;
  userName: string;
  currentRole: string;
}

async function handleRoleUpdate() {}

function UserActionsMenu({ userId, userName, currentRole }: UserActionsMenuProps) {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(currentRole);
  const [isPending, setIsPending] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontalIcon />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setRoleDialogOpen(true)}>Edit Role</DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem variant="destructive" onSelect={() => setDeleteDialogOpen(true)}>
            Delete User
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={roleDialogOpen} onOpenChange={() => setRoleDialogOpen((prev) => !prev)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change role for <b>{userName}</b>. Click <b>Update Role</b> when you are done.
            </DialogDescription>
          </DialogHeader>

          <Label htmlFor="role">Role</Label>
          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRoleUpdate}
              disabled={isPending || selectedRole === currentRole}
            >
              {isPending && <Spinner />}
              {isPending ? 'Updating Role...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UserActionsMenu;
