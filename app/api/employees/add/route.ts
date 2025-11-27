import { db } from '@/db/client'
import { employees } from '@/db/schema'
import { EmployeeNote } from '@/db/types'
import { auth } from '@/lib/auth'
import { eq, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const NewEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  fte: z.coerce.number().min(0).max(1),
  role: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  }),
  roleId: z.string().min(1),
  teamId: z.string().min(1),
  notes: z.array(z.custom<EmployeeNote>()).length(0),
})

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    console.log('received from frontend', body)
    const parsed = NewEmployeeSchema.parse(body)

    const id = crypto.randomUUID()

    const teamCountResult = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(employees)
      .where(eq(employees.teamId, parsed.teamId))

    const sortIndex = teamCountResult[0]?.count ?? 0
    console.log(sortIndex)

    const newEmployee = { id, ...parsed, sortIndex }

    await db.insert(employees).values(newEmployee)

    return NextResponse.json(newEmployee, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('zod error')
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('POST error', error)
    return NextResponse.json({ error: 'Failed to update employees' }, { status: 500 })
  }
}
