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
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'
import DnDContainer from './dnd-container'
import EmployeeCardOverlay from './employee-card-overlay'
import Header from './header'
import TrashZone from './trash-zone'

type Props = {
  initialEmployees: Record<string, Employee[]>
  teams: Team[]
  teamRoleTargets: TeamRoleTarget[]
  employeeNotes: EmployeeNote[]
}

function HomeWrapper({ initialEmployees, teams, teamRoleTargets, employeeNotes }: Props) {
  const [employeesByTeam, setEmployeesByTeam] = useState<Map<string, Employee[]>>(
    () => new Map(Object.entries(initialEmployees))
  )
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const previousEmployeeRef = useRef<Map<string, Employee[]>>(employeesByTeam)
  const [dragging, setDragging] = useState(false)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [openTeamMap, setOpenTeamMap] = useState<Record<string, boolean>>({})

  const allTeamsOpen = teams.every((team) => openTeamMap[team.id])

  const toggleOneTeam = (teamId: string) => {
    setOpenTeamMap((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }))
  }

  const toggleAllTeams = () => {
    const allOpen = teams.every((team) => openTeamMap[team.id])
    const newMap = Object.fromEntries(teams.map((team) => [team.id, !allOpen]))

    setOpenTeamMap(newMap)
  }

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

  return (
    <>
      <Header
        onEmployeeAdded={() => {}}
        toggleAllTeams={toggleAllTeams}
        allTeamsOpen={allTeamsOpen}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        // measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging, frequency: 200 } }}
      >
        <DnDContainer
          teams={teams}
          employeesByTeam={employeesByTeam}
          teamRoleTargets={teamRoleTargets}
          employeeNotes={employeeNotes}
          toggleOneTeam={toggleOneTeam}
          openTeamMap={openTeamMap}
        />
        {employeeToDelete && (
          <ConfirmDeleteDialog
            open={!!employeeToDelete}
            onCancel={() => setEmployeeToDelete(null)}
            onConfirm={async () => {
              const previousState = previousEmployeeRef.current
              setEmployeesByTeam((prev) => {
                const teamId = employeeToDelete.teamId
                if (!employeeToDelete || !teamId) return prev

                const newMap = new Map(prev)
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
    </>
  )
}

export default HomeWrapper
