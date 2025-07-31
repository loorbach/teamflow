import { employeeNotes, employees, roles, teamRoleTargets, teams } from '@/db/schema'
import { InferSelectModel } from 'drizzle-orm'

export type Employee = InferSelectModel<typeof employees>
export type Team = InferSelectModel<typeof teams>
export type Role = InferSelectModel<typeof roles>
export type TeamRoleTarget = InferSelectModel<typeof teamRoleTargets>
export type EmployeeNote = InferSelectModel<typeof employeeNotes>

export type OptimisticEmployeeNote = Omit<EmployeeNote, 'id' | 'userId' | 'createdAt'> & {
  id: string
  createdAt: string
  isPending?: boolean
}
