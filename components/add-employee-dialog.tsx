'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import AddEmployeeForm from './add-employee-form'

export function AddEmployeeDialog({ onEmployeeAdded }: { onEmployeeAdded: (employee) => void }) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <UserPlus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>Fill in details and save to add a new employee.</DialogDescription>
        </DialogHeader>
        <AddEmployeeForm onEmployeeAdded={onEmployeeAdded} onClose={() => setDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
