'use client'

import { Employee, EmployeeNote, Team, TeamRoleTarget } from '@/db/types'
import { useState } from 'react'
import DnDContainer from './dnd-container'

import Header from './header'

type Props = {
  initialEmployees: Employee[]
  teams: Team[]
  teamRoleTargets: TeamRoleTarget[]
  employeeNotes: EmployeeNote[]
}

function HomeWrapper({ initialEmployees, teams, teamRoleTargets, employeeNotes }: Props) {
  const [employeeList, setEmployeeList] = useState<Employee[]>(initialEmployees)
  // Prop drilling employees might become a problem later

  return (
    <>
      <Header
        onEmployeeAdded={(newEmp: Employee) => setEmployeeList((prev) => [...prev, newEmp])}
      />

      <DnDContainer
        teams={teams}
        employees={employeeList}
        setEmployees={setEmployeeList}
        teamRoleTargets={teamRoleTargets}
        employeeNotes={employeeNotes}
      />
    </>
  )
}

export default HomeWrapper
