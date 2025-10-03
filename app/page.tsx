import { auth } from '@/auth'
import HomeWrapper from '@/components/home-wrapper'
import { db } from '@/db/client'
import { employeeNotes, employees, roles, teamRoleTargets, teams } from '@/db/schema'
import { Employee } from '@/db/types'
import { asc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

async function Home() {
  const session = await auth()

  if (!session?.user) redirect('/login')

  const teamList = await db.select().from(teams)
  const employeesList = await db.select().from(employees).orderBy(asc(employees.sortIndex))

  const employeesByTeam = new Map<string, Employee[]>()
  teamList.forEach((team) => employeesByTeam.set(team.id, []))
  employeesList.forEach((employee) => {
    if (!employee || !employee.teamId) return
    const teamEmployees = employeesByTeam.get(employee.teamId)
    if (teamEmployees) teamEmployees.push(employee)
  })

  const roleTargetList = await db
    .select({
      teamId: teamRoleTargets.teamId,
      roleId: teamRoleTargets.roleId,
      targetFte: teamRoleTargets.targetFte,
      roleName: roles.name,
    })
    .from(teamRoleTargets)
    .innerJoin(roles, eq(teamRoleTargets.roleId, roles.id))
  const employeeNoteList = await db.select().from(employeeNotes)

  return (
    <HomeWrapper
      teams={teamList}
      initialEmployees={Object.fromEntries(employeesByTeam)}
      teamRoleTargets={roleTargetList}
      employeeNotes={employeeNoteList}
    />
  )
}

export default Home
