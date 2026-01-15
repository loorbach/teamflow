import {
  employeeNotes,
  employees,
  roles,
  teamRoleTargets,
  teams,
} from '@/db/schema';
import { InferSelectModel } from 'drizzle-orm';

export type Employee = InferSelectModel<typeof employees>;
export type Team = InferSelectModel<typeof teams>;
export type Role = InferSelectModel<typeof roles>;
export type TeamRoleTarget = InferSelectModel<typeof teamRoleTargets>;
export type EmployeeNote = InferSelectModel<typeof employeeNotes>;

export interface EmployeeWithNotes extends Employee {
  notes: EmployeeNote[];
  role: Role;
}

export type RoleTargetWithName = TeamRoleTarget & { roleName: string };
