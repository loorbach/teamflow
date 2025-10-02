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
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useRef, useState } from 'react'
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
  const previousEmployeeRef = useRef<Employee[]>(employees)
  const lastDragOverTime = useRef<number>(0)
  const THROTTLE_MS = 50

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

  async function persistEmployees(payload: Employee[] | null) {
    const previousState = previousEmployeeRef.current
    console.log(payload)

    if (!payload) return

    try {
      await fetch('/api/employees/bulk-update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employees: payload.map((e) => ({
            id: e.id,
            teamId: e.teamId,
            sortIndex: e.sortIndex,
          })),
        }),
      })
    } catch (error) {
      console.error('Failed to persist:', error)
      setEmployees(previousState)
      toast.error('Failed to save changes')
    }
  }

  function handleDragStart(event: DragStartEvent) {
    console.log('drag event fired', event.active.id)
    previousEmployeeRef.current = employees
    setActiveId(event.active.id)
    setDragging(true)
  }

  function handleDragOver(event: DragOverEvent) {
    //function is to show visual feedback when dragging between sortableContexts
    // console.log('handle Drag Over fired')
    const now = Date.now()
    // console.log(`last check was ${now - lastDragOverTime.current} ago`)
    if (now - lastDragOverTime.current < THROTTLE_MS) return
    lastDragOverTime.current = now

    const { active, over } = event
    if (!over) return
    // console.warn(over.id)

    const activeTeamId = findContainerId(active.id)
    const overTeamId = findContainerId(over.id)

    if (!activeTeamId || !overTeamId) return
    if (activeTeamId === overTeamId) return
    if (activeTeamId === overTeamId && active.id !== over.id) return

    if (activeTeamId !== overTeamId) {
      // console.log('dragging between containers!')
      // console.log(`${active.id} is being dragged from ${activeTeamId} to ${overTeamId}`)

      setEmployees((prevEmployees) => {
        const activeIndex = prevEmployees.findIndex((employeeObj) => employeeObj.id === active.id)
        // console.log('lookup done ,active index is ', activeIndex)
        if (activeIndex === -1) return prevEmployees

        const employee = prevEmployees[activeIndex]
        if (employee.teamId === overTeamId) return prevEmployees

        const updated = [...prevEmployees]
        updated[activeIndex] = { ...employee, teamId: overTeamId.toString() }

        // console.log(`${updated[activeIndex]} now has teamid ${updated[activeIndex].teamId}`)
        return updated
      })
      // console.log('employees now holds an optimistic team representation')
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragging(false)
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      setEmployees(previousEmployeeRef.current) //revert any preview changes
      return
    }

    if (over.id === 'trash') {
      const emp = employees.find((e) => e.id === active.id.toString())
      if (emp) setEmployeeToDelete(emp)
      setActiveId(null)
      return
    }

    const originalEmployee = previousEmployeeRef.current.find((e) => e.id === active.id)
    const originalTeamId = originalEmployee?.teamId
    const overTeamId = findContainerId(over.id)

    if (!originalTeamId || !overTeamId) {
      setActiveId(null)
      setEmployees(previousEmployeeRef.current)
      return
    }
    let payload: Employee[] | null = null

    setEmployees((prev) => {
      // console.warn(
      //   'inside drag end STATE SETTER',
      //   active.id,
      //   'is being moved',
      //   'originating from:',
      //   originalTeamId,
      //   'dropping onto',
      //   over.id,
      //   'originating in team:',
      //   overTeamId
      // )
      let nextEmployees: Employee[] = prev
      if (originalTeamId === overTeamId && active.id !== over.id) {
        //handling same team reorder, has access to unchanged state
        // console.log('initializing same team reorder')
        const oldIndex = prev.findIndex((e) => e.id === active.id)
        const newIndex = prev.findIndex((e) => e.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          const reIndexed = arrayMove(prev, oldIndex, newIndex)
          const reordered = reorderSortIndex(reIndexed, overTeamId) //needs to go to backend
          payload = reordered
          nextEmployees = [...prev.filter((e) => e.teamId !== overTeamId), ...reordered]
        }
      } else if (originalTeamId !== overTeamId && active.id !== over.id) {
        //remember teamID has changed on drag over if cross team dragging occurred
        // console.log('initializing cross team move')
        const targetTeamEmployees = previousEmployeeRef.current.filter(
          (e) => e.teamId === overTeamId
        )
        // console.log('dropping in team', targetTeamEmployees)
        const overIndex = targetTeamEmployees.findIndex((e) => e.id === over.id)
        // console.log('dropping on index', overIndex)

        if (overIndex !== -1 && over.id !== active.id) {
          targetTeamEmployees.splice(overIndex, 0, originalEmployee)
          const reordered = targetTeamEmployees.map((emp, idx) => ({
            ...emp,
            teamId: overTeamId.toString(),
            sortIndex: idx,
          }))

          // console.log('cross payload', reordered)

          payload = reordered

          // console.log('placed employee and reordered, also replaced teamids', reordered)

          nextEmployees = [...prev.filter((e) => e.teamId !== overTeamId), ...reordered]
        }
      }
      return nextEmployees
    })

    //TODO:

    //make route handle more efficiently with claude - dont make 10 sql statements
    //todo solve error when dropping in between team columns
    //solve jittery movement in chrome
    //minimize calls
    //optimize

    //persist to backend

    setActiveId(null)
    persistEmployees(payload)
    if (payload)
      toast.success(`${originalEmployee.firstName} ${originalEmployee.lastName} has been moved`, {
        description: `Click undo to revert this action`,
        action: { label: 'Undo', onClick: () => console.log('Undo clicked') },
      })
  }

  function handleDragCancel(event: DragCancelEvent) {
    setActiveId(null)
    setDragging(false)
    setEmployees(previousEmployeeRef.current) //revert any preview changes
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
      measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging, frequency: 200 } }}
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
        modifiers={[restrictToWindowEdges]}
      >
        {activeId ? <EmployeeCardOverlay employee={getEmployeeById(activeId)!} /> : null}
      </DragOverlay>
      <TrashZone visible={dragging} />
    </DndContext>
  )
}

export default DnDContainer
