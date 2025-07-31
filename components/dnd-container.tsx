'use client'

import { Employee, EmployeeNote, Team, TeamRoleTarget } from '@/db/types'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { useState } from 'react'
import TeamColumn from './team-column'

type Props = {
  employees: Employee[]
  teams: Team[]
  teamRoleTargets: TeamRoleTarget[]
  employeeNotes: EmployeeNote[]
}

function DnDContainer({ employees, teams, teamRoleTargets, employeeNotes: initialNotes }: Props) {
  const [employeeList, setEmployeeList] = useState(employees)
  const [employeeNotes, setEmployeeNotes] = useState<EmployeeNote[]>(initialNotes)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const employeeId = active.id.toString()
    const newTeamId = over.id.toString()

    setEmployeeList((prev) =>
      prev.map((emp) => (emp.id === employeeId ? { ...emp, teamId: newTeamId } : emp))
    )

    fetch('/api/employees/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, teamId: newTeamId }),
    })
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 flex-wrap px-4 py-2">
        {teams.map((team) => (
          <TeamColumn
            key={team.id}
            team={team}
            employees={employeeList.filter((e) => e.teamId === team.id)}
            teamRoleTargets={teamRoleTargets}
            employeeNotes={employeeNotes}
            onNoteAdded={(note) => setEmployeeNotes((prev) => [...prev, note])}
            onNoteDeleted={(noteId) =>
              setEmployeeNotes((prev) => prev.filter((n) => n.id !== noteId))
            }
          />
        ))}
      </div>
    </DndContext>
  )
}

export default DnDContainer
