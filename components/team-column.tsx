'use client'

import { Employee, EmployeeNote, EmployeeTag, Team, TeamRoleTarget } from '@/db/types'
import { useDroppable } from '@dnd-kit/core'
import { ChevronsUpDown, TriangleAlert } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Button } from './ui/button'
import { Card } from './ui/card'

const EmployeeCard = dynamic(() => import('./employee-card'), { ssr: false })

type Props = {
  team: Team
  employees: Employee[]
  teamRoleTargets: TeamRoleTarget[]
  employeeNotes: EmployeeNote[]
  employeeTags: EmployeeTag[]
  onNoteAdded: (note: EmployeeNote) => void
  onNoteDeleted: (noteId: string) => void
  onToggle: () => void
  open: boolean
}

function TeamColumn({
  team,
  employees,
  teamRoleTargets,
  employeeNotes,
  employeeTags,
  onNoteAdded,
  onNoteDeleted,
  onToggle,
  open,
}: Props) {
  const { setNodeRef } = useDroppable({ id: team.id })
  const currentTotalFte = employees.reduce((acc, el) => acc + el.fte, 0)
  const teamTotalFte = teamRoleTargets
    .filter((obj) => obj.teamId === team.id)
    .reduce((acc, el) => acc + parseFloat(el.targetFte), 0)

  return (
    <Card ref={setNodeRef} className="border rounded p-4 min-w-64 gap-0.75">
      <div className="flex justify-between items-center px-1 text-sm mb-2">
        <h2 className="tracking-tight text-foreground">{team.name}</h2>
        <span className="inline-flex items-center font-mono tracking-tighter text-card-foreground">
          {currentTotalFte.toFixed(1)}/{teamTotalFte.toFixed(1)}
          {Math.abs(currentTotalFte - teamTotalFte) > 1 && (
            <TriangleAlert className="ml-2 size-4 text-[var(--destructive)]" strokeWidth={2} />
          )}
        </span>
        <Button variant="secondary" size="icon" className="size-6" onClick={onToggle}>
          <ChevronsUpDown />
        </Button>
      </div>
      {open && (
        <ul className="mb-2 px-1 space-y-0.5 text-xs text-secondary-foreground font-mono">
          {teamRoleTargets
            .filter((target) => target.teamId === team.id)
            .map((target) => {
              const employeesInRole = employees.filter((e) => e.roleId === target.roleId)
              const currentFte = employeesInRole.reduce((sum, e) => sum + e.fte, 0)
              const delta = Math.abs(currentFte - parseFloat(target.targetFte))

              let color = 'text-destructive'
              if (delta <= 0.1) {
                color = 'text-[var(--success)]'
              } else if (delta <= 0.5) {
                color = 'text-[var(--warning)]'
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
            employeeTags={employeeTags}
          />
        ))}
      </div>
    </Card>
  )
}

export default TeamColumn
