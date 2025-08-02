'use server'

import { signOut } from '@/auth'

async function Logout() {
  await signOut()
}

export default Logout
