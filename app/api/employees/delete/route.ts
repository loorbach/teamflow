import { db } from '@/db/client'
import { employees } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { employeeId } = await req.json()

  await db.delete(employees).where(eq(employees.id, employeeId))

  return NextResponse.json({ success: true })
}
