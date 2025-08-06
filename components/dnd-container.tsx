'use client'

import { Employee, EmployeeNote, Team, TeamRoleTarget } from '@/db/types'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'
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

  function handleDragEnd(event: DragEndEvent) {
    setDragging(false)

    const { active, over } = event
    if (!over) return

    const employeeId = active.id.toString()

    if (over.id === 'trash') {
      const emp = employees.find((e) => e.id === employeeId)
      if (emp) setEmployeeToDelete(emp)
      return
    }

    const newTeamId = over.id.toString()

    setEmployees((prev) =>
      prev.map((emp) => (emp.id === employeeId ? { ...emp, teamId: newTeamId } : emp))
    )

    fetch('/api/employees/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, teamId: newTeamId }),
    })
  }

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={() => setDragging(true)}>
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
      <TrashZone visible={dragging} />
    </DndContext>
  )
}

export default DnDContainer
