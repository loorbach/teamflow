import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: process.env.NODE_ENV === 'production' ? './drizzle' : './drizzle-local',
  schema: './db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
