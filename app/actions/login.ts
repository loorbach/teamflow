'use server'
import { signIn } from '@/auth'

async function loginAction(formData: FormData) {
  const entries = Object.fromEntries(formData.entries())

  await signIn('credentials', {
    ...entries,
    redirectTo: '/',
  })
}

export default loginAction
