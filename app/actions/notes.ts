'use server'

import { db } from '@/db/client'
import { employeeNotes } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { z } from 'zod'

const schema = z.object({
  employeeId: z.string().min(1),
  note: z.string().trim().min(1).max(144),
})

export async function addNote(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || !session.user) {
    throw new Error('Not authenticated')
  }

  const parsed = schema.safeParse({
    employeeId: formData.get('employeeId'),
    note: formData.get('note'),
  })

  if (!parsed.success) {
    throw new Error('Invalid input')
  }

  const { employeeId, note } = parsed.data
  try {
    const [newNote] = await db
      .insert(employeeNotes)
      .values({
        employeeId,
        note,
        userId: session.user.id,
      })
      .returning()

    return newNote
  } catch (error) {
    console.error('Failed to add note', error)
    throw new Error('Failed to add note')
  }
}

const deleteSchema = z.object({
  noteId: z.string().min(1),
})

export async function deleteNote(noteId: string) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || !session.user) throw new Error('Not authenticated')

  const parsed = deleteSchema.safeParse({
    noteId,
  })

  if (!parsed.success) {
    throw new Error('Invalid input')
  }

  try {
    await db.delete(employeeNotes).where(eq(employeeNotes.id, noteId))
  } catch (error) {
    console.error('Failed to delete note', error)
    throw new Error('Failed to delete note')
  }
}
