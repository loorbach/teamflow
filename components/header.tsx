import { EmployeeWithNotes } from '@/db/types'
import MainMenu from './main-menu'
import { ModeToggle } from './mode-toggle'

function Header({ onEmployeeAdded }: { onEmployeeAdded: (employee: EmployeeWithNotes) => void }) {
  return (
    <header className="flex justify-between gap-8 items-center px-4 py-2">
      <MainMenu onEmployeeAdded={onEmployeeAdded} />
      <div className="flex items-center gap-2">
        <h1 className="text-muted-foreground text-sm">teamflow 0.1.0</h1>
        <ModeToggle />
      </div>
    </header>
  )
}

export default Header
