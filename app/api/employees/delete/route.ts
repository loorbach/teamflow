import { db } from '@/db/client';
import { employees } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { employeeId } = await req.json();

  await db.delete(employees).where(eq(employees.id, employeeId));

  return NextResponse.json({ success: true });
}
