'use client'

import { Employee, EmployeeNote, Team, TeamRoleTarget } from '@/db/types'
import { memo, useCallback, useState } from 'react'
import TeamColumn from './team-column'

type Props = {
  employeesByTeam: Map<string, Employee[]>
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
  employeeNotes: initialNotes,
  teams,
  teamRoleTargets,
  toggleOneTeam,
  openTeamMap,
}: Props) {
  const [employeeNotes, setEmployeeNotes] = useState<EmployeeNote[]>(initialNotes)

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
  )
}

export default DnDContainer
