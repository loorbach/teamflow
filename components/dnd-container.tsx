'use client'

import { Employee, EmployeeNote, Team, TeamRoleTarget } from '@/db/types'
import {
  closestCorners,
  DndContext,
  DragCancelEvent,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'
import EmployeeCardOverlay from './employee-card-overlay'
import TeamColumn from './team-column'
import TrashZone from './trash-zone'

type Props = {
  employees: Employee[]
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>
  teams: Team[]
  teamRoleTargets: TeamRoleTarget[]
  employeeNotes: EmployeeNote[]
  toggleOneTeam: (teamId: string) => void
  openTeamMap: Record<string, boolean>
}

function DnDContainer({
  employees,
  setEmployees,
  teams,
  teamRoleTargets,
  employeeNotes: initialNotes,
  toggleOneTeam,
  openTeamMap,
}: Props) {
  const [employeeNotes, setEmployeeNotes] = useState<EmployeeNote[]>(initialNotes)
  const [dragging, setDragging] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function getEmployeeById(id: UniqueIdentifier | null): Employee | undefined {
    if (!id) return undefined
    return employees.find((e) => e.id === id)
  }

  function findContainerId(itemId: UniqueIdentifier): UniqueIdentifier | undefined {
    if (teams.some((team) => team.id === itemId)) return itemId

    const emp = employees.find((emp) => emp.id === itemId)
    return emp?.teamId ?? undefined
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id)
    setDragging(true)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event

    if (!over) return

    const activeContainerId = findContainerId(active.id)
    const overContainerId = findContainerId(over.id)

    if (!activeContainerId || !overContainerId) return //if active or over container are null, return
    if (activeContainerId === overContainerId) return //if not dragging between different containers, return
    if (activeContainerId === overContainerId && active.id !== over.id) return //if active and over are equal, eg dragging in the same container, we dont wanna do anything. this iwll be handled in dragend
    if (activeContainerId !== overContainerId) {
      console.log(`${active.id} is being dragged from ${activeContainerId} to ${overContainerId}`)
      setEmployees((prevEmployees) => {
        const activeIndex = prevEmployees.findIndex((employeeObj) => employeeObj.id === active.id)
        console.log(activeIndex)
        if (activeIndex === -1) return prevEmployees

        const employee = prevEmployees[activeIndex]
        const updated = [...prevEmployees]
        updated[activeIndex] = { ...employee, teamId: overContainerId.toString() }
        return updated
      })
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragging(false)

    const { active, over } = event
    if (!over) {
      setActiveId(null)
      return
    }
    if (over.id === 'trash') {
      console.log('over.id trash block', over.id, active.id.toString(), active.id)
      const emp = employees.find((e) => e.id === active.id.toString())
      if (emp) setEmployeeToDelete(emp)
      setActiveId(null)
      return
    }
    const activeContainerId = findContainerId(active.id)
    const overContainerId = findContainerId(over.id)

    if (!activeContainerId || !overContainerId) {
      setActiveId(null)
      return
    }

    if (activeContainerId === overContainerId && active.id !== over.id) {
      console.log('attempting to sort inside of same team, using:', active.id, over.id)
      const oldIndex = employees.findIndex((e) => e.id === active.id)
      const newIndex = employees.findIndex((e) => e.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        setEmployees((prev) => arrayMove(prev, oldIndex, newIndex))
      }
    } else {
      //cross team move
      console.log('attempting cross team move, trying to replace teamId of ? to', overContainerId)
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === active.id ? { ...emp, teamId: overContainerId.toString() } : emp
        )
      )
    }

    fetch('/api/employees/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: active.id, teamId: overContainerId }),
    })

    console.log('drag ended', event)
  }

  function handleDragCancel(event: DragCancelEvent) {
    setActiveId(null)
    setDragging(false)
    void event
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging, frequency: 30 } }}
    >
      <div className="flex gap-4 flex-wrap px-4 py-2">
        {teams.map((team) => (
          <TeamColumn
            key={team.id}
            team={team}
            employees={employees.filter((e) => e.teamId === team.id)}
            teamRoleTargets={teamRoleTargets}
            employeeNotes={employeeNotes}
            onNoteAdded={(note) => setEmployeeNotes((prev) => [...prev, note])}
            onNoteDeleted={(noteId) =>
              setEmployeeNotes((prev) => prev.filter((n) => n.id !== noteId))
            }
            onToggle={() => toggleOneTeam(team.id)}
            open={!!openTeamMap[team.id]}
          />
        ))}
      </div>
      {employeeToDelete && (
        <ConfirmDeleteDialog
          open={!!employeeToDelete}
          onCancel={() => setEmployeeToDelete(null)}
          onConfirm={async () => {
            setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete.id))

            await fetch('/api/employees/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ employeeId: employeeToDelete.id }),
            })

            toast('Employee Removed', {
              description: `${employeeToDelete.firstName} ${employeeToDelete.lastName} has been removed.`,
            })

            setEmployeeToDelete(null)
          }}
        />
      )}

      <DragOverlay
        dropAnimation={{
          duration: 150,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeId ? <EmployeeCardOverlay employee={getEmployeeById(activeId)!} /> : null}
      </DragOverlay>
      <TrashZone visible={dragging} />
    </DndContext>
  )
}

export default DnDContainer
