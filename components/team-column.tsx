'use client'

import { Employee, EmployeeNote, Team, TeamRoleTarget } from '@/db/types'
import { useDroppable } from '@dnd-kit/core'
import { ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import EmployeeCard from './employee-card'
import { Button } from './ui/button'
import { Card } from './ui/card'

type Props = {
  team: Team
  employees: Employee[]
  teamRoleTargets: TeamRoleTarget[]
  employeeNotes: EmployeeNote[]
  onNoteAdded: (note: EmployeeNote) => void
  onNoteDeleted: (noteId: string) => void
}

function TeamColumn({
  team,
  employees,
  teamRoleTargets,
  employeeNotes,
  onNoteAdded,
  onNoteDeleted,
}: Props) {
  const { setNodeRef } = useDroppable({ id: team.id })
  const [open, setOpen] = useState(false)
  const currentTotalFte = employees.reduce((acc, el) => acc + parseFloat(el.fte), 0)
  const teamTotalFte = teamRoleTargets
    .filter((obj) => obj.teamId === team.id)
    .reduce((acc, el) => acc + parseFloat(el.targetFte), 0)

  return (
    <Card ref={setNodeRef} className="border rounded p-4 min-w-64 gap-0.75">
      <div className="flex justify-between items-center px-1 text-sm mb-2">
        <h2 className="tracking-tight">{team.name}</h2>
        <span className="font-mono tracking-tighter">
          {currentTotalFte.toFixed(1)}/{teamTotalFte.toFixed(1)}
        </span>
        <Button
          variant="secondary"
          size="icon"
          className="size-6 hover:cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <ChevronsUpDown />
        </Button>
      </div>
      {open && (
        <ul className="mb-2 px-1 space-y-0.5 text-xs text-gray-700 font-mono">
          {teamRoleTargets
            .filter((target) => target.teamId === team.id)
            .map((target) => {
              const employeesInRole = employees.filter((e) => e.roleId === target.roleId)
              const currentFte = employeesInRole.reduce((sum, e) => sum + parseFloat(e.fte), 0)
              const delta = Math.abs(currentFte - parseFloat(target.targetFte))

              let color = 'text-red-500'
              if (delta <= 0.1) {
                color = 'text-green-600'
              } else if (delta <= 0.5) {
                color = 'text-yellow-600'
              }

              return (
                <li
                  key={`${target.teamId}-${target.roleId}`}
                  className="flex justify-between tracking-tight"
                >
                  <span>{target.roleId}</span>
                  <span className={color}>
                    {currentFte.toFixed(1)} / {parseFloat(target.targetFte).toFixed(1)}
                  </span>
                </li>
              )
            })}
        </ul>
      )}
      <div className="flex flex-col space-y-1.5">
        {employees.map((emp) => (
          <EmployeeCard
            key={emp.id}
            employee={emp}
            employeeNotes={employeeNotes}
            onNoteAdded={onNoteAdded}
            onNoteDeleted={onNoteDeleted}
          />
        ))}
      </div>
    </Card>
  )
}

export default TeamColumn
