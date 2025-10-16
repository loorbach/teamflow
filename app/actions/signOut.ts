'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

async function logoutAction() {
  try {
    await auth.api.signOut({
      asResponse: true,
      headers: await headers(),
    })
  } catch (error) {
    console.error(error)
  }
  redirect('/login')
}

export default logoutAction
