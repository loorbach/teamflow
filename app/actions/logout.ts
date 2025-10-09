'use server'

import { signOut } from '@/auth'

async function logoutAction() {
  await signOut()
}

export default logoutAction
