import { EmployeeWithNotes } from '@/db/types'
import HeaderControls from './header-controls'
import UserMenu from './user-menu'

type Props = {
  onEmployeeAdded: (employee: EmployeeWithNotes) => void
}

function Header({ onEmployeeAdded }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-border">
      <div className="flex items-center gap-1">
        <h1 className="font-semibold text-foreground">teamflow</h1>
      </div>

      <HeaderControls onEmployeeAdded={onEmployeeAdded} />

      <UserMenu />
    </header>
  )
}

export default Header
