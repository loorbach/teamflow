import {
  boolean,
  index,
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

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

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

export const employees = pgTable(
  'employees',
  {
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
  },
  (table) => {
    return {
      teamIdIndex: index('idx_employees_team_id').on(table.teamId),
    }
  }
)

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
    .references(() => user.id),
  note: varchar('note', { length: 144 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
})
