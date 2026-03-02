import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from '../db/client';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      organization_id: {
        type: 'string',
        required: true,
        fieldName: 'organization_id',
        input: true, //TODO: set to false
      },
      role: {
        type: 'string',
        required: true,
        input: true, //TODO: set to false
        fieldName: 'role',
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, //5 minutes
    },
  },

  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
