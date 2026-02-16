import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins';
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
        input: false,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, //5 minutes
    },
  },

  plugins: [
    nextCookies(),
    admin(),
    inferAdditionalFields({ user: { organization_id: { type: 'string' } } }),
  ],
});

export type Session = typeof auth.$Infer.Session;
