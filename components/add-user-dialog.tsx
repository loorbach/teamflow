import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AddUserForm from './add-user-form';

export function AddUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Fill in details and save to add a new user to the database.
          </DialogDescription>
        </DialogHeader>
        <AddUserForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
