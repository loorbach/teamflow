'use client';

import editRoleAction from '@/app/actions/editRole';
import { AlertCircle, MoreHorizontalIcon } from 'lucide-react';
import { useActionState, useState } from 'react';
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
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Spinner } from './ui/spinner';

interface Props {
  userId: string;
  userName: string;
  currentRole: string;
}

function UserActionsMenu({ userId, userName, currentRole }: Props) {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(editRoleAction, null);

  console.log('useractionsmenu', state);

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
          <DropdownMenuItem
            disabled={currentRole === 'admin'}
            onSelect={() => setRoleDialogOpen(true)}
          >
            Edit Role
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Are you sure you want set user role for <b>{userName}</b> to <b>admin</b>?
            </DialogDescription>
          </DialogHeader>

          <form action={formAction}>
            <input type="hidden" value={userId} name="userId"></input>
            <DialogFooter>
              {state && !state.ok && (
                <div className="text-destructive text-sm flex gap-1 items-center">
                  <AlertCircle size={16}></AlertCircle>
                  {state.message}
                </div>
              )}
              <Button
                variant="outline"
                type="button"
                onClick={() => setRoleDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner />}
                {isPending ? 'Updating Role...' : 'Update Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UserActionsMenu;
