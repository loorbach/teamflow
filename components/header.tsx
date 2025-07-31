import { Flower, FoldVertical } from 'lucide-react'
import { SignOut } from './signout-button'
import { Toggle } from './ui/toggle'

function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b shadow">
      <div className="flex items-center gap-1">
        <Flower className="text-blue-400" />
        <h1 className="text-md">teamflow</h1>
      </div>

      <div className="flex items-center gap-2">
        <Toggle variant="outline" className="hover:cursor-pointer" aria-label="Fold cards">
          <FoldVertical className="h-4 w-4" />
        </Toggle>
      </div>

      <SignOut />
    </header>
  )
}

export default Header
