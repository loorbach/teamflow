import type { AdapterAccountType } from '@auth/core/adapters'
import {
  boolean,
  integer,
  numeric,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

//auth
export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  passwordHash: text('passwordHash'),
})

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
)

export const authenticators = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
)

//core functionality
export const roles = pgTable('roles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
})

export const teams = pgTable('teams', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
})

export const employees = pgTable('employees', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  fte: real('fte').notNull(),
  roleId: text('role_id')
    .notNull()
    .references(() => roles.id),
  teamId: text('team_id').references(() => teams.id),
  sortIndex: integer('sort_index').notNull(),
})

export const teamRoleTargets = pgTable(
  'team_role_targets',
  {
    teamId: text('team_id')
      .notNull()
      .references(() => teams.id),
    roleId: text('role_id')
      .notNull()
      .references(() => roles.id),
    targetFte: numeric('target_fte').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.teamId, table.roleId] }),
  })
)

export const employeeNotes = pgTable('employee_notes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  employeeId: text('employee_id')
    .notNull()
    .references(() => employees.id, {
      onDelete: 'cascade',
    }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  note: varchar('note', { length: 144 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
})
