'use client'

import { EmployeeWithNotes, Team, TeamRoleTarget } from '@/db/types'
import { cn } from '@/lib/utils'
import { CollisionPriority } from '@dnd-kit/abstract'
import { useDroppable } from '@dnd-kit/react'
import { ChevronDown, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import EmployeeCard from './employee-card'
import { Button } from './ui/button'
import { Card } from './ui/card'

type Props = {
  team: Team
  employees: EmployeeWithNotes[]
  teamRoleTargets: TeamRoleTarget[]
}

function TeamColumn({ team, employees, teamRoleTargets }: Props) {
  const [open, setOpen] = useState<boolean>(false)
  const { isDropTarget, ref } = useDroppable({
    id: team.id,
    type: 'team',
    accept: 'employee',
    collisionPriority: CollisionPriority.Lowest,
  })
  const currentTotalFte = employees.reduce((acc, el) => acc + el.fte, 0)
  const teamTotalFte = teamRoleTargets
    .filter((obj) => obj.teamId === team.id)
    .reduce((acc, el) => acc + parseFloat(el.targetFte), 0)
  console.log(`TeamColumn rerender: ${team.id}`)

  return (
    <Card
      className={cn(
        'border rounded p-4 min-w-64 gap-0.75 transition-all duration-200 ease-out',
        isDropTarget && 'border-[var(--brand)] scale-105'
      )}
    >
      <div className="flex justify-between items-center px-1 text-sm mb-2">
        <h2 className="tracking-tight text-foreground">{team.name}</h2>
        <span className="inline-flex items-center font-mono tracking-tighter text-card-foreground">
          {currentTotalFte.toFixed(1)}/{teamTotalFte.toFixed(1)}
          {Math.abs(currentTotalFte - teamTotalFte) > 1 && (
            <TriangleAlert className="ml-2 size-4 text-[var(--destructive)]" strokeWidth={2} />
          )}
        </span>
        <Button
          variant="secondary"
          size="icon"
          className="size-6"
          onClick={() => setOpen((prev) => !prev)}
        >
          <ChevronDown
            className={cn('transition-transform duration-200 ease-out', open && 'rotate-180')}
          />
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

      <div ref={ref} className="flex flex-col space-y-1.5 min-h-[43.5px]">
        {employees.map((emp, idx) => (
          <EmployeeCard key={emp.id} employee={emp} teamId={team.id} index={idx} />
        ))}
      </div>
    </Card>
  )
}

export default TeamColumn
