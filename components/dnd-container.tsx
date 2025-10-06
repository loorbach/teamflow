'use client'

import { EmployeeWithNotes, Team, TeamRoleTarget } from '@/db/types'
import { UniqueIdentifier } from '@dnd-kit/abstract'
import { memo } from 'react'
import TeamColumn from './team-column'

type Props = {
  employeesByTeam: Map<UniqueIdentifier, EmployeeWithNotes[]>
  teams: Team[]
  teamRoleTargets: TeamRoleTarget[]
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

  if (prev.teamRoleTargets !== next.teamRoleTargets) {
    console.log('RERENDER: teamRoleTargets reference changed')
    equal = false
  }

  return equal
})

function DnDContainer({ employeesByTeam, teams, teamRoleTargets }: Props) {
  return (
    <div className="flex gap-4 flex-wrap px-4 py-2 items-start">
      {teams.map((team) => {
        const teamEmployees = employeesByTeam.get(team.id) ?? []
        return (
          <MemoizedTeamColumn
            key={team.id}
            team={team}
            employees={teamEmployees}
            teamRoleTargets={teamRoleTargets}
          />
        )
      })}
    </div>
  )
}

export default DnDContainer
