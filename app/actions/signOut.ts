'use server';

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      console.error(error);
      throw new Error('Unexpected Sign Out error, contact administrator');
    }
  }
  redirect('/login');
}

export default signOutAction;
