import logoutAction from '@/app/actions/logout'
import { LogOut } from 'lucide-react'

export function SignOut() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex items-center justify-between gap-2 hover:cursor-pointer w-full"
      >
        <LogOut />
        Log out
      </button>
    </form>
  )
}
