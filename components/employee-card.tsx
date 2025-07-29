'use client'

import { Employee, EmployeeNote } from '@/db/types'
import { useDraggable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { GripVertical } from 'lucide-react'
import { useMemo, useState } from 'react'

type Props = {
  employee: Employee
  employeeNotes: EmployeeNote[]
}

function EmployeeCard({ employee, employeeNotes }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: employee.id,
  })
  const [expanded, setExpanded] = useState(false)
  const notesForEmployee = useMemo(
    () => employeeNotes.filter((note) => note.employeeId === employee.id),
    [employeeNotes, employee.id]
  )

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, transition: 'transform 0.001s' }
    : undefined

  return (
    <motion.div
      layout
      ref={setNodeRef}
      style={style}
      role="button"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer select-none px-2 py-1 border rounded shadow bg-white hover:border-blue-400 transition-colors duration-200 outline-none"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-drag-handle]')) return
        setExpanded(!expanded)
      }}
    >
      <div className="flex justify-between items-center text-sm gap-2">
        <div>
          <div className="font-medium leading-tight">
            {employee.firstName} {employee.lastName}
          </div>
          <div className="text-xs text-gray-500">{employee.roleId}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-mono text-right">{employee.fte}</div>
          <div {...listeners} {...attributes} data-drag-handle>
            <GripVertical className="w-6 h-6 cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-500" />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t text-xs text-gray-600 space-y-1">
          {notesForEmployee.length > 0 ? (
            notesForEmployee.map((note) => (
              <div key={note.id} className="w-full overflow-hidden">
                <div className="line-clamp-2 truncate overflow-hidden whitespace-nowrap max-w-full">
                  {note.note}
                </div>
                <div className="text-[10px] text-gray-400">
                  {note.createdAt
                    ? new Date(note.createdAt).toLocaleDateString('nl-NL')
                    : 'Unknown date'}
                </div>
              </div>
            ))
          ) : (
            <div className="italic text-gray-400">No notes available.</div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default EmployeeCard
