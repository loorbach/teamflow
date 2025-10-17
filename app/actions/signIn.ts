'use server'

import { auth } from '@/lib/auth'
import { APIError } from 'better-auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

type Error = {
  ok: boolean
  message: string
  status: string | number
}

async function signInAction(currentState: Error | null, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe: false,
        callbackURL: '/',
      },
      headers: await headers(),
    })
  } catch (error) {
    if (error instanceof APIError) {
      console.error(error.message, error.status)
      return { ok: false, message: error.message, status: error.status }
    }
    return { ok: false, message: 'Unexpected error', status: 500 }
  }
  redirect('/')
}

export default signInAction
