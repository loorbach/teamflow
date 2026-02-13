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
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Spinner } from './ui/spinner';

function AddUserForm({ onClose }: { onClose: () => void }) {
  const [roleId, setRoleId] = useState<'user' | 'admin'>('user');
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const name = formData.get('name') as string;
        const password = formData.get('password') as string;

        try {
          const { data: newUser, error } = await authClient.admin.createUser({
            email,
            password,
            name,
            role: roleId,
          });

          setIsPending(false);

          if (error) {
            toast.error(error.message || 'Failed to create user');
            return;
          }

          if (newUser) {
            toast.success('User added succesfully');
            onClose();
            router.refresh();
          }
        } catch (error) {
          console.error('Unexpected error', error);
          toast.error('An unexpected error occurred. Please try again.');
        } finally {
          setIsPending(false);
        }
      }}
    >
      <div className="grid gap-3">
        <Label htmlFor="name">Name</Label>
        <Input id="name" type="text" required name="name" />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required name="email" />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required name="password" />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="role">Role</Label>
        <Select
          value={roleId}
          onValueChange={(value) => setRoleId(value as 'user' | 'admin')}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a team" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <input type="hidden" name="role" value={roleId ?? ''} />
      </div>

      <DialogFooter className="mt-2">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner />}
          {isPending ? 'Saving user...' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default AddUserForm;
