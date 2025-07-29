import { db } from '@/db/client'
import { employees } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  const { employeeId, teamId } = await req.json()

  await db.update(employees).set({ teamId }).where(eq(employees.id, employeeId))

  return new Response(null, { status: 204 })
}
