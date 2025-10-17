import HomeWrapper from '@/components/home-wrapper'
import { db } from '@/db/client'
import { employeeNotes, employees, roles, teamRoleTargets, teams } from '@/db/schema'
import { EmployeeNote, EmployeeWithNotes } from '@/db/types'
import { auth } from '@/lib/auth'
import { asc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || !session.user) {
    redirect('/login')
  }

  const teamList = await db.select().from(teams)
  const employeesList = await db.select().from(employees).orderBy(asc(employees.sortIndex))
  const employeeNoteList = await db.select().from(employeeNotes)

  const notesByEmployee = new Map<string, EmployeeNote[]>()
  employeeNoteList.forEach((note) => {
    if (!notesByEmployee.has(note.employeeId)) {
      notesByEmployee.set(note.employeeId, [])
    }
    notesByEmployee.get(note.employeeId)!.push(note)
  })

  const employeesByTeam = new Map<string, EmployeeWithNotes[]>()
  teamList.forEach((team) => employeesByTeam.set(team.id, []))

  employeesList.forEach((employee) => {
    if (!employee || !employee.teamId) return
    const teamEmployees = employeesByTeam.get(employee.teamId)

    const employeeWithNotes: EmployeeWithNotes = {
      ...employee,
      notes: notesByEmployee.get(employee.id) || [],
    }

    if (teamEmployees) teamEmployees.push(employeeWithNotes)
  })

  console.log('employees by team', employeesByTeam)

  const roleTargetList = await db
    .select({
      teamId: teamRoleTargets.teamId,
      roleId: teamRoleTargets.roleId,
      targetFte: teamRoleTargets.targetFte,
      roleName: roles.name,
    })
    .from(teamRoleTargets)
    .innerJoin(roles, eq(teamRoleTargets.roleId, roles.id))

  return (
    <HomeWrapper
      teams={teamList}
      initialEmployees={Object.fromEntries(employeesByTeam)}
      teamRoleTargets={roleTargetList}
    />
  )
}

export default Home
