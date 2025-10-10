'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmployeeWithNotes } from '@/db/types'
import AddEmployeeForm from './add-employee-form'

export function AddEmployeeDialog({
  onEmployeeAdded,
  open,
  onOpenChange,
}: {
  onEmployeeAdded: (employee: EmployeeWithNotes) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>Fill in details and save to add a new employee.</DialogDescription>
        </DialogHeader>
        <AddEmployeeForm onEmployeeAdded={onEmployeeAdded} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
