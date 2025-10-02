import { Employee } from '@/db/types'
import { GripVertical } from 'lucide-react'

function EmployeeCardOverlay({ employee }: { employee: Employee }) {
  return (
    <div className="w-full max-w-[222px] cursor-pointer select-none px-2 py-1 border border-border rounded shadow bg-card hover:border-blue-400 transition-colors duration-200 outline-none text-card-foreground">
      <div className="flex justify-between items-center text-sm gap-2">
        <div>
          <div className="font-medium leading-tight flex items-center gap-1">
            {employee.firstName} {employee.lastName}
          </div>
          <div className="text-xs text-muted-foreground">{employee.roleId}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-mono text-right">{employee.fte}</div>

          <GripVertical className="w-6 h-6 cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded text-muted-foreground hover:text-blue-600 transition-colors duration-200" />
        </div>
      </div>
    </div>
  )
}

export default EmployeeCardOverlay
