import { signOut } from '@/auth'
import { LogOut } from 'lucide-react'
import { Button } from './ui/button'

export function SignOut() {
  return (
    <form
      action={async () => {
        'use server'
        await signOut()
      }}
    >
      <Button variant="secondary" type="submit" className="hover:cursor-pointer hover:text-red-500">
        <LogOut className="h-4 w-4" />
      </Button>
    </form>
  )
}
