import HomeWrapper from '@/components/home-wrapper';
import { db } from '@/db/client';
import { employeeNotes, employees, roles, teamRoleTargets, teams } from '@/db/schema';
import { EmployeeNote, EmployeeWithNotes, RoleTargetWithName } from '@/db/types';
import { auth } from '@/lib/auth';
import { asc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    redirect('/login');
  }

  const teamList = await db.select().from(teams);
  const employeesList = await db
    .select()
    .from(employees)
    .leftJoin(roles, eq(employees.roleId, roles.id))
    .orderBy(asc(employees.sortIndex));
  const employeeNoteList = await db.select().from(employeeNotes);
  const roleList = await db.select().from(roles);

  // console.log('emp list', employeesList)

  const notesByEmployee = new Map<string, EmployeeNote[]>();
  employeeNoteList.forEach((note) => {
    if (!notesByEmployee.has(note.employeeId)) {
      notesByEmployee.set(note.employeeId, []);
    }
    notesByEmployee.get(note.employeeId)!.push(note);
  });

  const employeesByTeam = new Map<string, EmployeeWithNotes[]>();
  const rolesByTeam = new Map<string, RoleTargetWithName[]>();

  teamList.forEach((team) => {
    employeesByTeam.set(team.id, []);
    rolesByTeam.set(team.id, []);
  });

  employeesList.forEach((employee) => {
    if (!employee || !employee.employees.teamId || !employee.roles) return;
    const teamEmployees = employeesByTeam.get(employee.employees.teamId);

    const employeeWithNotes: EmployeeWithNotes = {
      ...employee.employees,
      role: employee.roles,
      notes: notesByEmployee.get(employee.employees.id) || [],
    };

    if (teamEmployees) teamEmployees.push(employeeWithNotes);
  });

  // console.log('employees by team', employeesByTeam)

  const roleTargetList: RoleTargetWithName[] = await db
    .select({
      teamId: teamRoleTargets.teamId,
      roleId: teamRoleTargets.roleId,
      targetFte: teamRoleTargets.targetFte,
      roleName: roles.name,
    })
    .from(teamRoleTargets)
    .innerJoin(roles, eq(teamRoleTargets.roleId, roles.id));

  // console.log('roleTargetList in page.tsx', roleTargetList)

  roleTargetList.forEach((roleTarget) => {
    if (!roleTarget || !roleTarget.teamId) return;

    const teamArray = rolesByTeam.get(roleTarget.teamId);
    if (!teamArray) return;
    teamArray.push(roleTarget);
  });

  // console.log('roleList', roleList, teamList)

  return (
    <HomeWrapper
      teams={teamList}
      roles={roleList}
      initialEmployees={Object.fromEntries(employeesByTeam)}
      roleTargets={rolesByTeam}
    />
  );
}

export default Home;
