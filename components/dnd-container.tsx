'use client'

import { Employee, EmployeeNote, Team, TeamRoleTarget } from '@/db/types'
import {
  closestCorners,
  DndContext,
  DragCancelEvent,
  DragEndEvent,
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
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { memo, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'
import EmployeeCardOverlay from './employee-card-overlay'
import TeamColumn from './team-column'
import TrashZone from './trash-zone'

type Props = {
  employeesByTeam: Map<string, Employee[]>
  setEmployeesByTeam: React.Dispatch<React.SetStateAction<Map<string, Employee[]>>>
  teams: Team[]
  teamRoleTargets: TeamRoleTarget[]
  employeeNotes: EmployeeNote[]
  toggleOneTeam: (teamId: string) => void
  openTeamMap: Record<string, boolean>
}

const MemoizedTeamColumn = memo(TeamColumn, (prev, next) => {
  let equal = true

  if (prev.team.id !== next.team.id) {
    console.log('RERENDER: team.id changed', prev.team.id, next.team.id)
    equal = false
  }

  if (prev.employees !== next.employees) {
    console.log('RERENDER: employees reference changed for team', next.team.id)
    equal = false
  }

  if (prev.open !== next.open) {
    console.log('RERENDER: open changed for team', next.team.id)
    equal = false
  }

  if (prev.teamRoleTargets !== next.teamRoleTargets) {
    console.log('RERENDER: teamRoleTargets reference changed')
    equal = false
  }

  if (prev.employeeNotes !== next.employeeNotes) {
    console.log('RERENDER: employeeNotes reference changed')
    equal = false
  }

  if (prev.onToggle !== next.onToggle) {
    console.log('RERENDER: onToggle reference changed for team', next.team.id)
    equal = false
  }

  return equal
})

function DnDContainer({
  employeesByTeam,
  setEmployeesByTeam,
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
  const previousEmployeeRef = useRef<Map<string, Employee[]>>(employeesByTeam)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function getEmployeeById(id: UniqueIdentifier | null): Employee | undefined {
    if (!id) return undefined
    for (const employees of employeesByTeam.values()) {
      const employee = employees.find((e) => e.id === id)
      if (employee) return employee
    }
  }

  function findContainerId(itemId: UniqueIdentifier): UniqueIdentifier | undefined {
    if (teams.some((team) => team.id === itemId)) return itemId

    for (const [teamId, employees] of employeesByTeam.entries()) {
      if (employees.some((emp) => emp.id === itemId)) return teamId
    }
  }

  async function persistEmployees(changedEmployees: Employee[] | null) {
    const previousState = previousEmployeeRef.current
    if (!changedEmployees) return
    console.log('sending these to the backend!', changedEmployees)

    try {
      await fetch('/api/employees/bulk-update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employees: changedEmployees.map((e) => ({
            id: e.id,
            teamId: e.teamId,
            sortIndex: e.sortIndex,
          })),
        }),
      })
      toast.success(`Employee has been moved`, {
        description: `Click undo to revert this action`,
        action: { label: 'Undo', onClick: () => setEmployeesByTeam(previousState) },
      })
    } catch (error) {
      console.error('Failed to persist:', error)
      setEmployeesByTeam(previousState)
      toast.error('Failed to save changes')
    }
  }

  function handleDragStart(event: DragStartEvent) {
    console.log('drag event fired', event.active.id)
    console.log(employeesByTeam)
    previousEmployeeRef.current = new Map(employeesByTeam)
    setActiveId(event.active.id)
    setDragging(true)
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragging(false)
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      setEmployeesByTeam(previousEmployeeRef.current)
      return
    }

    if (over.id === 'trash') {
      const emp = getEmployeeById(active.id)
      if (emp) setEmployeeToDelete(emp)
      setActiveId(null)
      return
    }

    const activeTeamId = findContainerId(active.id)
    const overTeamId = findContainerId(over.id)

    if (!activeTeamId || !overTeamId) {
      setActiveId(null)
      return
    }

    let changedEmployees: Employee[] | null = null

    setEmployeesByTeam((prevMap) => {
      const map = new Map(prevMap)

      if (activeTeamId === overTeamId && active.id !== over.id) {
        const teamId = activeTeamId.toString()
        const oldArray = map.get(teamId)
        if (!oldArray) return map

        const newArray = [...oldArray]
        const oldIndex = newArray.findIndex((e) => e.id === active.id)
        const newIndex = newArray.findIndex((e) => e.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return map

        const [moved] = newArray.splice(oldIndex, 1)
        console.log(moved)
        newArray.splice(newIndex, 0, moved)
        newArray.forEach((e, i) => (e.sortIndex = i))
        changedEmployees = newArray

        map.set(teamId, newArray)
      } else if (activeTeamId !== overTeamId) {
        const sourceId = activeTeamId.toString()
        const targetId = overTeamId.toString()
        const sourceArray = map.get(sourceId)
        const targetArray = map.get(targetId)
        if (!sourceArray || !targetArray) return map

        const newSource = [...sourceArray]
        const newTarget = [...targetArray]

        const sourceIndex = newSource.findIndex((e) => e.id === active.id)
        const targetIndex = newTarget.findIndex((e) => e.id === over.id)
        if (sourceIndex === -1 || targetIndex === -1) return map

        const [moved] = newSource.splice(sourceIndex, 1)
        moved.teamId = targetId
        newTarget.splice(targetIndex, 0, moved)

        newSource.forEach((e, i) => (e.sortIndex = i))
        newTarget.forEach((e, i) => (e.sortIndex = i))
        changedEmployees = newSource.concat(newTarget)

        map.set(sourceId, newSource)
        map.set(targetId, newTarget)
      }

      return map
    })

    setActiveId(null)
    if (changedEmployees) persistEmployees(changedEmployees)
  }

  function handleDragCancel(event: DragCancelEvent) {
    setActiveId(null)
    setDragging(false)
    setEmployeesByTeam(previousEmployeeRef.current) //revert any preview changes
    void event
  }

  const handleNoteAdded = useCallback((note: EmployeeNote) => {
    setEmployeeNotes((prev) => [...prev, note])
  }, [])

  const handleNoteDeleted = useCallback((noteId: string) => {
    setEmployeeNotes((prev) => prev.filter((n) => n.id !== noteId))
  }, [])

  const stableToggle = useCallback(
    (teamId: string) => {
      toggleOneTeam(teamId)
    },
    [toggleOneTeam]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      // onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging, frequency: 200 } }}
    >
      <div className="flex gap-4 flex-wrap px-4 py-2">
        {teams.map((team) => {
          const teamEmployees = employeesByTeam.get(team.id) ?? []
          return (
            <MemoizedTeamColumn
              key={team.id}
              team={team}
              employees={teamEmployees}
              teamRoleTargets={teamRoleTargets}
              employeeNotes={employeeNotes}
              onNoteAdded={handleNoteAdded}
              onNoteDeleted={handleNoteDeleted}
              onToggle={() => stableToggle(team.id)}
              open={!!openTeamMap[team.id]}
            />
          )
        })}
      </div>
      {employeeToDelete && (
        <ConfirmDeleteDialog
          open={!!employeeToDelete}
          onCancel={() => setEmployeeToDelete(null)}
          onConfirm={async () => {
            const previousState = previousEmployeeRef.current
            setEmployeesByTeam((prev) => {
              const newMap = new Map(prev)
              const teamId = employeeToDelete.teamId
              if (!employeeToDelete || !teamId) return
              const teamEmployees = newMap.get(teamId) ?? []
              newMap.set(
                teamId,
                teamEmployees.filter((e) => e.id !== employeeToDelete.id)
              )
              return newMap
            })
            try {
              await fetch('/api/employees/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId: employeeToDelete.id }),
              })

              toast.success(`Employee has been removed`, {
                description: `Click undo to revert this action`,
                action: {
                  label: 'Undo',
                  onClick: () => setEmployeesByTeam(previousState),
                },
              })

              setEmployeeToDelete(null)
            } catch (error) {
              console.error('Failed to persist:', error)
              setEmployeesByTeam(previousState)
              toast.error('Failed to save changes')
            }
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
