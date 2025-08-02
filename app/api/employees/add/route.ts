import { db } from '@/db/client'
import { employees } from '@/db/schema'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const NewEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  fte: z.coerce.number().min(0).max(1),
  roleId: z.string().min(1),
  teamId: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = NewEmployeeSchema.parse(body)

    const newEmployee = {
      id: crypto.randomUUID(),
      ...parsed,
    }

    await db.insert(employees).values(newEmployee)

    return NextResponse.json(newEmployee, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      const fieldErrors = err.issues.reduce(
        (acc, issue) => {
          const field = issue.path[0] as string
          acc[field] = issue.message
          return acc
        },
        {} as Record<string, string>
      )

      return NextResponse.json({ error: fieldErrors }, { status: 400 })
    }

    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
