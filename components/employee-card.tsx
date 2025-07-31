'use client'

import { addNote } from '@/app/actions/notes'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Employee, EmployeeNote } from '@/db/types'
import { useDraggable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { CirclePlus, GripVertical } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'

type Props = {
  employee: Employee
  employeeNotes: EmployeeNote[]
  onNoteAdded: (note: EmployeeNote) => void
}

function EmployeeCard({ employee, employeeNotes, onNoteAdded }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: employee.id,
  })
  const [expanded, setExpanded] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [popoverOpen, setPopoverOpen] = useState(false)
  const notesForEmployee = useMemo(
    () => employeeNotes.filter((note) => note.employeeId === employee.id),
    [employeeNotes, employee.id]
  )
  const noteCount = notesForEmployee.length

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
      className="w-full max-w-[222px] cursor-pointer select-none px-2 py-1 border rounded shadow bg-white hover:border-blue-400 transition-colors duration-200 outline-none"
    >
      <div
        className="flex justify-between items-center text-sm gap-2"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-drag-handle]')) return
          setExpanded(!expanded)
        }}
      >
        <div>
          <div className="font-medium leading-tight flex items-center gap-1">
            {employee.firstName} {employee.lastName}
            {noteCount > 0 && (
              <Badge
                variant="secondary"
                className="h-5 min-w-5 px-1 font-mono tabular-nums bg-blue-400 text-white"
              >
                {noteCount}
              </Badge>
            )}
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
        <div className="mt-2 text-xs text-gray-600 space-y-1 hover:cursor-default">
          {notesForEmployee.length > 0 &&
            notesForEmployee.map((note) => (
              <div key={note.id} className="overflow-hidden border-t pt-2">
                <div className="line-clamp-4">{note.note}</div>
                <div className="text-[11px] text-gray-900 mt-0.5">
                  {note.createdAt
                    ? new Date(note.createdAt).toLocaleDateString('nl-NL')
                    : 'Unknown date'}
                </div>
              </div>
            ))}
          <div className="border-t mt-2">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="my-1 hover:cursor-pointer">
                  <CirclePlus />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="">
                <form
                  className="flex flex-col gap-2"
                  action={async (formData) => {
                    const note = await addNote(formData)
                    onNoteAdded(note)
                    setNoteText('')
                    setPopoverOpen(false)
                  }}
                >
                  <h4 className="leading-none text-sm">Max 144 characters. Enter to save.</h4>
                  <input type="hidden" name="employeeId" value={employee.id} />
                  <Textarea
                    autoFocus
                    required
                    maxLength={144}
                    className="resize-none text-sm"
                    name="note"
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        e.currentTarget.form?.requestSubmit()
                      }
                      if (e.key === 'Escape') {
                        setPopoverOpen(false)
                      }
                    }}
                  />
                  <Button type="submit" size="sm" disabled={noteText.trim().length === 0}>
                    Save
                  </Button>
                </form>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default EmployeeCard
