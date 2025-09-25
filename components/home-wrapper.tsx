'use client'

import { Employee, EmployeeNote, Team, TeamRoleTarget } from '@/db/types'
import { useState } from 'react'
import DnDContainer from './dnd-container'

import Header from './header'

type Props = {
  initialEmployees: Employee[] //SELECT * FROM employees
  teams: Team[]
  teamRoleTargets: TeamRoleTarget[]
  employeeNotes: EmployeeNote[]
}

function HomeWrapper({ initialEmployees, teams, teamRoleTargets, employeeNotes }: Props) {
  const [employeeList, setEmployeeList] = useState<Employee[]>(initialEmployees)
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
        onEmployeeAdded={(newEmp: Employee) => setEmployeeList((prev) => [...prev, newEmp])}
        toggleAllTeams={toggleAllTeams}
        allTeamsOpen={allTeamsOpen}
      />

      <DnDContainer
        teams={teams}
        employees={employeeList}
        setEmployees={setEmployeeList}
        teamRoleTargets={teamRoleTargets}
        employeeNotes={employeeNotes}
        toggleOneTeam={toggleOneTeam}
        openTeamMap={openTeamMap}
      />
    </>
  )
}

export default HomeWrapper
