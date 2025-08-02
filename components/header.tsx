import { Employee } from '@/db/types'
import { Flower } from 'lucide-react'
import HeaderControls from './header-controls'
import UserMenu from './user-menu'

type Props = {
  onEmployeeAdded: (employee: Employee) => void
}

function Header({ onEmployeeAdded }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b shadow">
      <div className="flex items-center gap-1">
        <Flower className="text-blue-400" />
        <h1 className="text-md">teamflow</h1>
      </div>

      <HeaderControls onEmployeeAdded={onEmployeeAdded} />

      <UserMenu />
    </header>
  )
}

export default Header
