import { db } from '@/db/client'
import { employees } from '@/db/schema'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const NewEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  fte: z.coerce.number().min(0).max(1),
  roleId: z.string().min(1),
  teamId: z.string().min(1),
  sortIndex: z.number().int().min(0),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log(body)
    const parsed = NewEmployeeSchema.parse(body)
    console.log(parsed)

    const [newEmployee] = await db.insert(employees).values(parsed).returning()
    console.log(newEmployee)

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
