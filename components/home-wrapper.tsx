'use client';

import { Employee, EmployeeWithNotes, Role, RoleTargetWithName, Team } from '@/db/types';
import { UniqueIdentifier } from '@dnd-kit/abstract';
import { RestrictToWindow } from '@dnd-kit/dom/modifiers';
import { DragDropProvider } from '@dnd-kit/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from './confirm-delete-dialog';
import DnDContainer from './dnd-container';
import Header from './header';
import TrashZone from './trash-zone';

type Props = {
  initialEmployees: Record<string, EmployeeWithNotes[]>;
  teams: Team[];
  roles: Role[];
  roleTargets: Map<string, RoleTargetWithName[]>;
};

function HomeWrapper({ initialEmployees, teams, roles, roleTargets }: Props) {
  const [employeesByTeam, setEmployeesByTeam] = useState<
    Map<UniqueIdentifier, EmployeeWithNotes[]>
  >(() => new Map(Object.entries(initialEmployees)));
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeWithNotes | null>(null);
  const previousEmployeeRef = useRef<Map<UniqueIdentifier, EmployeeWithNotes[]>>(employeesByTeam);
  const [dragging, setDragging] = useState(false);

  // console.log('empbt val', employeesByTeam.values())

  function getEmployeeById(id: string | null): EmployeeWithNotes | undefined {
    if (!id) return undefined;
    for (const employees of employeesByTeam.values()) {
      const employee = employees.find((e) => e.id === id);
      if (employee) return employee;
    }
  }

  function findContainerId(itemId: number | string): UniqueIdentifier | undefined {
    if (teams.some((team) => team.id === itemId)) return itemId;

    for (const [teamId, employees] of employeesByTeam.entries()) {
      if (employees.some((emp) => emp.id === itemId)) return teamId;
    }
  }

  async function persistEmployees(changedEmployees: Employee[] | null) {
    const previousState = previousEmployeeRef.current;
    if (!changedEmployees) return;
    // console.log('sending these to the backend!', changedEmployees)

    try {
      await fetch('/api/employees/bulk-update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employees: changedEmployees.map((e) => ({
            id: e.id,
            teamId: e.teamId,
            sortIndex: e.sortIndex,
          })),
        }),
      });
      toast.success('Employee has been moved', {
        description: 'Click undo to revert this action',
        action: {
          label: 'Undo',
          onClick: () => setEmployeesByTeam(previousState),
        },
      });
    } catch (error) {
      console.error('Failed to persist:', error);
      setEmployeesByTeam(previousState);
      toast.error('Failed to save changes');
    }
  }

  function handleDragStart() {
    previousEmployeeRef.current = new Map(employeesByTeam);
    setDragging(true);
  }

  // @ts-expect-error event type unkown because of experimental state dnd-kit 04-10-2025
  function handleDragOver(event) {
    event.preventDefault();
    // const { source, target } = event.operation
    // if (!target) return
    // console.log('source', source.id) // ← always equals target when e.prevD is not used
    // console.log('target', target.id)
    // console.log(isSortable(event.operation.target))
  }

  // @ts-expect-error event type unkown because of experimental state dnd-kit 04-10-2025
  function handleDragEnd(event) {
    const { source, target } = event.operation;
    const { canceled } = event;

    setDragging(false);

    if (canceled) {
      // console.log(`Cancelled dragging ${source.id}`)
      setDragging(false);
      setEmployeesByTeam(previousEmployeeRef.current);
      return;
    }

    if (!target) {
      setEmployeesByTeam(previousEmployeeRef.current);
      return;
    }

    if (target.id === 'trash') {
      const emp = getEmployeeById(source.id);
      if (emp) setEmployeeToDelete(emp);
      return;
    }

    // console.log(`Dropped ${source.id} over ${target.id}`)

    const sourceTeamId = findContainerId(source.id);
    const targetTeamId = findContainerId(target.id);
    // console.log('teamids', sourceTeamId, targetTeamId)

    if (!sourceTeamId || !targetTeamId) {
      return;
    }

    setEmployeesByTeam((prevMap) => {
      let changedEmployees: EmployeeWithNotes[] | null = null;
      const map = new Map(prevMap);

      if (sourceTeamId === targetTeamId && source.id !== target.id) {
        console.warn('initiating reorder');
        const teamId = sourceTeamId.toString();
        const oldArray = map.get(teamId);
        if (!oldArray) return map;

        const newArray = [...oldArray];
        const oldIndex = newArray.findIndex((e) => e.id === source.id);
        const newIndex = newArray.findIndex((e) => e.id === target.id);

        if (oldIndex === -1 || newIndex === -1) return map;

        const [moved] = newArray.splice(oldIndex, 1);
        newArray.splice(newIndex, 0, moved);
        newArray.forEach((e, i) => (e.sortIndex = i));
        changedEmployees = newArray;

        map.set(teamId, newArray);
      } else if (sourceTeamId !== targetTeamId) {
        console.warn('initializing cross team move');

        const sourceId = sourceTeamId.toString();
        const targetId = targetTeamId.toString();

        const sourceArray = map.get(sourceId);
        const targetArray = map.get(targetId);
        if (!sourceArray || !targetArray) return map;

        const newSource = [...sourceArray];
        const newTarget = [...targetArray];
        const sourceIndex = newSource.findIndex((e) => e.id === source.id);
        if (sourceIndex === -1) return map;

        const isTargetTeam = teams.some((team) => team.id === target.id);
        let targetIndex = 0;

        if (isTargetTeam) {
          if (targetArray.length === 0) {
            // console.log('dropping on empty team')
            targetIndex = 0;
          } else {
            // console.log('dropping on team with employees')
            targetIndex = newTarget.length;
          }
        } else {
          targetIndex = newTarget.findIndex((e) => e.id === target.id);
          if (targetIndex === -1) return map;
        }

        // console.log(sourceIndex)
        // console.log(targetIndex)

        const [moved] = newSource.splice(sourceIndex, 1);
        moved.teamId = targetId;
        newTarget.splice(targetIndex, 0, moved);

        newSource.forEach((e, i) => (e.sortIndex = i));
        newTarget.forEach((e, i) => (e.sortIndex = i));
        // console.log('newTarget', newTarget, moved)
        changedEmployees = newSource.concat(newTarget);

        map.set(sourceId, newSource);
        map.set(targetId, newTarget);
      }

      if (changedEmployees) {
        // console.log('calling persist')
        persistEmployees(changedEmployees);
      }
      return map;
    });
  }

  return (
    <>
      <Header
        onEmployeeAdded={(newEmployee: EmployeeWithNotes) => {
          setEmployeesByTeam((prevMap) => {
            const newMap = new Map(prevMap);
            const teamId = newEmployee.teamId;
            if (!teamId) return prevMap;

            const teamEmployees = prevMap.get(teamId) ?? [];

            const updated = [...teamEmployees, newEmployee];

            newMap.set(teamId, updated);

            return newMap;
          });
        }}
        roles={roles}
        teams={teams}
      />
      <DragDropProvider
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[RestrictToWindow]}
      >
        <DnDContainer
          teams={teams}
          employeesByTeam={employeesByTeam}
          roleTargets={roleTargets}
          setEmployeesByTeam={setEmployeesByTeam}
        />
        {employeeToDelete && (
          <ConfirmDeleteDialog
            open={!!employeeToDelete}
            onCancel={() => setEmployeeToDelete(null)}
            onConfirm={async () => {
              const previousState = previousEmployeeRef.current;
              setEmployeesByTeam((prev) => {
                const teamId = employeeToDelete.teamId;
                if (!employeeToDelete || !teamId) return prev;

                const newMap = new Map(prev);
                const teamEmployees = newMap.get(teamId) ?? [];
                newMap.set(
                  teamId,
                  teamEmployees.filter((e) => e.id !== employeeToDelete.id),
                );
                return newMap;
              });
              try {
                await fetch('/api/employees/delete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ employeeId: employeeToDelete.id }),
                });

                toast.success('Employee has been removed', {
                  description: 'Click undo to revert this action',
                  action: {
                    label: 'Undo',
                    onClick: () => setEmployeesByTeam(previousState),
                  },
                });

                setEmployeeToDelete(null);
              } catch (error) {
                console.error('Failed to persist:', error);
                setEmployeesByTeam(previousState);
                toast.error('Failed to save changes');
              }
            }}
          />
        )}

        <TrashZone visible={dragging} />
      </DragDropProvider>
    </>
  );
}

export default HomeWrapper;
