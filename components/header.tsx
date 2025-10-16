import { EmployeeWithNotes } from '@/db/types'
import { authClient } from '@/lib/auth-client'
import MainMenu from './main-menu'
import { ModeToggle } from './mode-toggle'

function Header({ onEmployeeAdded }: { onEmployeeAdded: (employee: EmployeeWithNotes) => void }) {
  const { data: session } = authClient.useSession()

  return (
    <header className="flex justify-between gap-8 items-center px-4 py-2">
      <MainMenu onEmployeeAdded={onEmployeeAdded} />
      <div className="flex items-center gap-2">
        {session?.user && (
          <h1 className="text-muted-foreground text-sm">welcome {session?.user.name}</h1>
        )}
        <ModeToggle />
      </div>
    </header>
  )
}

export default Header
