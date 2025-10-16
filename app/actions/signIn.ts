'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await auth.api.signInEmail({
      asResponse: true,
      body: {
        email,
        password,
        rememberMe: false,
        callbackURL: '/',
      },
      headers: await headers(),
    })
  } catch (error) {
    console.error(error)
  }
  redirect('/')
}

export default signInAction
