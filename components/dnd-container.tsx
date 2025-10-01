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

  function reorderSortIndex(employeesArray: Employee[], teamId: UniqueIdentifier): Employee[] {
    return employeesArray
      .filter((emp) => emp.teamId === teamId)
      .map((emp, idx) => ({ ...emp, sortIndex: idx }))
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id)
    setDragging(true)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return
    const activeTeamId = findContainerId(active.id)
    const overTeamId = findContainerId(over.id)

    if (!activeTeamId || !overTeamId) return //if active or over container are null, return
    if (activeTeamId === overTeamId) return //if not dragging between different containers, return
    if (activeTeamId === overTeamId && active.id !== over.id) return //if active and over are equal, eg dragging in the same container, we dont wanna do anything. this iwll be handled in dragend

    if (activeTeamId !== overTeamId) {
      console.log(`${active.id} is being dragged from ${activeTeamId} to ${overTeamId}`)
      // setEmployees((prevEmployees) => {
      //   const activeIndex = prevEmployees.findIndex((employeeObj) => employeeObj.id === active.id)
      //   if (activeIndex === -1) return prevEmployees

      //   const employee = prevEmployees[activeIndex]
      //   const updated = [...prevEmployees]
      //   updated[activeIndex] = { ...employee, teamId: overTeamId.toString() }
      //   return updated
      // })
    }
  }

  async function test(affectedEmps: Employee[]) {
    try {
      await fetch('/api/employees/bulk-update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application-json' },
        body: JSON.stringify({
          employees: affectedEmps.map((e) => ({
            id: e.id,
            teamId: e.teamId,
            sortIndex: e.sortIndex,
          })),
        }),
      })
    } catch (error) {
      console.error('Failed to persist:', error)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragging(false) //remove trash droppable

    const { active, over } = event //destructure event vars
    if (!over) {
      setActiveId(null)
      return
    }

    if (over.id === 'trash') {
      const emp = employees.find((e) => e.id === active.id.toString())
      if (emp) setEmployeeToDelete(emp)
      setActiveId(null)
      return
    }

    const activeTeamId = findContainerId(active.id)
    const overTeamId = findContainerId(over.id)
    console.log('ids', active.id, over.id, activeTeamId, overTeamId)

    if (!activeTeamId || !overTeamId) {
      setActiveId(null)
      return
    }

    let nextEmployees: Employee[] = employees

    if (activeTeamId === overTeamId && active.id !== over.id) {
      console.log('hitting reorder block', activeTeamId, overTeamId)
      console.log(
        'previous state of team',
        employees.filter((e) => e.teamId === overTeamId)
      )
      //reordering
      const oldIndex = employees.findIndex((e) => e.id === active.id)
      const newIndex = employees.findIndex((e) => e.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reIndexed = arrayMove(employees, oldIndex, newIndex)
        const reordered = reorderSortIndex(reIndexed, activeTeamId)
        console.log('new reordered state', reordered)
        //reordered is changed team, nextEmployees is overall new state array
        nextEmployees = [...employees.filter((e) => e.teamId !== activeTeamId), ...reordered]
      }
    } else if (activeTeamId !== overTeamId && active.id !== over.id) {
      // cross team move
      console.log('hitting crossteam block', activeTeamId, overTeamId)
      const moved = employees.map((emp) =>
        emp.id === active.id ? { ...emp, teamId: overTeamId.toString() } : emp
      )
      const reordered = reorderSortIndex(moved, overTeamId)
      nextEmployees = [...moved.filter((e) => e.teamId !== overTeamId), ...reordered]
    }

    if (nextEmployees !== employees) {
      setEmployees(nextEmployees)

      //how do I only send changed teams / employees to backend
      //how do I update visual state on handleDragOver without losing activeTeamId

      test(nextEmployees)
    }
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
