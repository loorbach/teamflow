'use client'

import { addNote, deleteNote, editNote } from '@/app/actions/notes'
import { EmployeeWithNotes } from '@/db/types'
import { UniqueIdentifier } from '@dnd-kit/abstract'
import { useSortable } from '@dnd-kit/react/sortable'
import { AnimatePresence, motion } from 'framer-motion'
import { EllipsisVertical, MessageCircleMore, PenLine } from 'lucide-react'
import { useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Textarea } from './ui/textarea'

type Props = {
  employee: EmployeeWithNotes
  index: number
  teamId: string
  setEmployeesByTeam: React.Dispatch<
    React.SetStateAction<Map<UniqueIdentifier, EmployeeWithNotes[]>>
  >
}

function EmployeeCard({ employee, index, teamId, setEmployeesByTeam }: Props) {
  const { ref } = useSortable({
    id: employee.id,
    index,
    type: 'employee',
    accept: 'employee',
    group: teamId,
  })
  // isDragging and isDropTarget will cause employeeCard rerendering of sortables in question
  const [expanded, setExpanded] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editNoteText, setEditNoteText] = useState('')
  const [showEditDialog, setShowEditDialog] = useState(false)
  const noteCount = employee.notes.length
  const currentNote = employee.notes.find((n) => n.id === editingNoteId)
  // console.log('employee data:', employee)
  console.log('rerendering employee:', employee.firstName, employee.lastName)

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId)
    setEmployeesByTeam((prevMap) => {
      const newMap = new Map(prevMap)
      const teamId = employee.teamId?.toString()
      if (!teamId) return prevMap
      const team = prevMap.get(teamId)
      if (!team) return prevMap
      const newTeam = team.map((emp) => {
        if (emp.id === employee.id) {
          const newNotes = emp.notes.filter((n) => noteId !== n.id)
          return { ...emp, notes: newNotes }
        }
        return emp
      })
      newMap.set(teamId, newTeam)
      return newMap
    })
  }

  const handleAddNote = async (formData: FormData) => {
    const note = await addNote(formData)
    setEmployeesByTeam((prevMap) => {
      const newMap = new Map(prevMap)
      const teamId = employee.teamId?.toString()
      if (!teamId) return prevMap
      const team = prevMap.get(teamId)
      if (!team) return prevMap
      const newTeam = team.map((emp) =>
        emp.id === employee.id ? { ...emp, notes: [...emp.notes, note] } : emp
      )
      newMap.set(teamId, newTeam)
      return newMap
    })
    setNoteText('')
    setPopoverOpen(false)
  }

  const handleEditNote = async (noteId: string, formData: FormData, employeeId: string) => {
    console.log('made it inside handleEdit note with', noteId, formData.get('note'), employeeId)
    const updatedNote = await editNote(formData, noteId, employeeId)

    setEmployeesByTeam((prevMap) => {
      const newMap = new Map(prevMap)
      const teamId = employee.teamId?.toString()
      if (!teamId) return prevMap
      const team = prevMap.get(teamId)
      if (!team) return prevMap
      const newTeam = team.map((emp) => {
        if (emp.id === employee.id) {
          const newNotes = emp.notes.map((note) => (note.id === noteId ? updatedNote : note))
          return { ...emp, notes: newNotes }
        }
        return emp
      })

      newMap.set(teamId, newTeam)
      return newMap
    })

    setEditingNoteId(null)
    setShowEditDialog(false)
  }

  return (
    <div
      ref={ref}
      className="w-full max-w-[222px] cursor-pointer select-none px-2 py-1 border border-border rounded shadow-xs hover:shadow-sm bg-card transition-shadow duration-150 ease-out text-card-foreground"
    >
      <div
        className="flex justify-between items-start text-sm gap-2 active:scale-99 active:outline-none active:shadow-none duration-150 ease-out transition-all"
        role="button"
        onClick={(e) => {
          e.stopPropagation()
          setExpanded((prev) => !prev)
        }}
      >
        <div className="flex flex-col overflow-hidden">
          <div className="font-medium leading-tight truncate">
            {employee.firstName} {employee.lastName}
          </div>
          <div className="flex text-xs text-muted-foreground truncate gap-0.75">
            <span className="truncate">{employee.role.name}</span>
            <span className="flex-shrink-0">{employee.fte}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {noteCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 px-1 font-mono tabular-nums text-white bg-[var(--brand)]"
            >
              <MessageCircleMore />
              {noteCount}
            </Badge>
          )}
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ y: -5, opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.05, ease: 'easeOut' }}
            className="mt-2 text-xs hover:cursor-default"
          >
            {employee.notes &&
              employee.notes.length > 0 &&
              employee.notes.map((note) => (
                <div
                  key={note.id}
                  className="flex justify-between items-center overflow-hidden border-t py-1.5"
                >
                  <div>
                    <div className="text-secondary-foreground font-medium">{note.note}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {note.createdAt ? new Date(note.createdAt).toDateString() : 'Unknown date'}
                    </div>
                  </div>

                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" aria-label="Open menu" size="icon-sm">
                        <EllipsisVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-25" align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditingNoteId(note.id)
                            setEditNoteText(note.note)
                            setShowEditDialog(true)
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDeleteNote(note.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            <div className="border-t flex gap-2 items-center py-1">
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="icon-sm"
                    aria-label="Add Note"
                    variant="outline"
                    className="active:scale-93 transition-transform duration-150 ease-out"
                  >
                    <PenLine className="size-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <form
                    className="flex flex-col gap-3"
                    action={(formData) => handleAddNote(formData)}
                  >
                    <h4 className="leading-none text-sm">Type to add a note.</h4>
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
                    <Button
                      variant="outline"
                      type="submit"
                      size="sm"
                      disabled={noteText.trim().length === 0}
                    >
                      Save
                    </Button>
                  </form>
                </PopoverContent>
              </Popover>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {currentNote && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit note</DialogTitle>
              <DialogDescription>
                Edit an existing note for {employee.firstName} {employee.lastName}. Click edit when
                you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <form
              action={(formData) => handleEditNote(currentNote.id, formData, employee.id)}
              className="flex flex-col gap-4"
            >
              <Label htmlFor="editNoteInput" className="sr-only"></Label>
              <Input
                id="editNoteInput"
                className="resize-none"
                name="note"
                maxLength={144}
                value={editNoteText}
                onChange={(e) => setEditNoteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    e.currentTarget.form?.requestSubmit()
                  }
                }}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={editNoteText.trim().length === 0 || editNoteText === currentNote.note}
                >
                  Edit
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default EmployeeCard
