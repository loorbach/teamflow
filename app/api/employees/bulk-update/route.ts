import { db } from '@/db/client';
import { employees } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const BulkUpdateSchema = z.object({
  employees: z
    .array(
      z.object({
        id: z.uuid(),
        teamId: z.string().min(1).optional(),
        sortIndex: z.number().int().min(0),
      }),
    )
    .min(1)
    .max(100),
});

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { employees: updates } = BulkUpdateSchema.parse(body);

    // console.log('received employees', updates)
    // console.log(updates.length)

    await db.transaction(async (tx) => {
      for (const update of updates) {
        // console.log('iterating over updates, update:', update)
        // console.log('setting teamId and sortIndex of:', update.id, update.teamId, update.sortIndex)
        await tx
          .update(employees)
          .set({
            teamId: update.teamId,
            sortIndex: update.sortIndex,
          })
          .where(eq(employees.id, update.id));
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 },
      );
    }
    console.error('PATCH error', error);
    return NextResponse.json({ error: 'Failed to update employees' }, { status: 500 });
  }
}
