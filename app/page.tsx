import { auth } from '@/auth'
import HomeWrapper from '@/components/home-wrapper'
import { db } from '@/db/client'
import { employeeNotes, employees, employeeTags, roles, teamRoleTargets, teams } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

async function Home() {
  const session = await auth()

  if (!session?.user) redirect('/login')

  const teamList = await db.select().from(teams)
  const employeesList = await db.select().from(employees)
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
  const employeeTagList = await db.select().from(employeeTags)

  return (
    <HomeWrapper
      teams={teamList}
      initialEmployees={employeesList}
      teamRoleTargets={roleTargetList}
      employeeNotes={employeeNoteList}
      employeeTags={employeeTagList}
    />
  )
}

export default Home
