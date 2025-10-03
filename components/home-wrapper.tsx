'use client'

import { Employee, EmployeeNote, Team, TeamRoleTarget } from '@/db/types'
import { useState } from 'react'
import DnDContainer from './dnd-container'

import Header from './header'

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

  return (
    <>
      <Header
        onEmployeeAdded={() => {}}
        toggleAllTeams={toggleAllTeams}
        allTeamsOpen={allTeamsOpen}
      />

      <DnDContainer
        teams={teams}
        employeesByTeam={employeesByTeam}
        setEmployeesByTeam={setEmployeesByTeam}
        teamRoleTargets={teamRoleTargets}
        employeeNotes={employeeNotes}
        toggleOneTeam={toggleOneTeam}
        openTeamMap={openTeamMap}
      />
    </>
  )
}

export default HomeWrapper
