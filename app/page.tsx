import { auth } from '@/auth'
import DnDContainer from '@/components/dnd-container'
import Header from '@/components/header'
import { db } from '@/db/client'
import { employeeNotes, employees, roles, teamRoleTargets, teams } from '@/db/schema'
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
  // console.log(roleTargetList);

  const employeeNoteList = await db.select().from(employeeNotes)

  return (
    <>
      <Header />
      <DnDContainer
        teams={teamList}
        employees={employeesList}
        teamRoleTargets={roleTargetList}
        employeeNotes={employeeNoteList}
      />
    </>
  )
}

export default Home
