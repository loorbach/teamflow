'use client'

import signOutAction from '@/app/actions/signOut'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmployeeWithNotes } from '@/db/types'
import { useState } from 'react'
import { AddEmployeeDialog } from './add-employee-dialog'

function MainMenu({ onEmployeeAdded }: { onEmployeeAdded: (employee: EmployeeWithNotes) => void }) {
  const [openAddEmployeeDialog, setOpenAddEmployeeDialog] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="">
            Menu
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-46" align="start">
          <DropdownMenuLabel>Teamflow 0.1.0</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem disabled>
              Settings
              {/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem disabled>Request feature</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenAddEmployeeDialog(true)}>
              Add Employee
              {/* <DropdownMenuShortcut>⌘+E</DropdownMenuShortcut> */}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <form className="w-full" action={signOutAction}>
              <button className="w-full text-left" type="submit">
                Sign Out
              </button>
            </form>
            {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddEmployeeDialog
        open={openAddEmployeeDialog}
        onOpenChange={setOpenAddEmployeeDialog}
        onEmployeeAdded={onEmployeeAdded}
      />
    </>
  )
}

export default MainMenu
