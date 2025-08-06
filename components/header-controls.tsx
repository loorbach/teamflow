'use client'
import { Employee } from '@/db/types'
import { FoldVertical } from 'lucide-react'
import { AddEmployeeDialog } from './add-employee-dialog'
import { Toggle } from './ui/toggle'

type Props = {
  onEmployeeAdded: (employee: Employee) => void
}

function HeaderControls({ onEmployeeAdded }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Toggle className="hover:cursor-pointer" aria-label="Fold cards">
        <FoldVertical className="h-4 w-4" />
      </Toggle>
      <AddEmployeeDialog onEmployeeAdded={onEmployeeAdded} />
    </div>
  )
}

export default HeaderControls
