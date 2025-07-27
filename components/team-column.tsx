"use client"

import { Employee, Team } from "@/db/types";
import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence } from "framer-motion";
import EmployeeCard from "./employee-card";
import { Card } from "./ui/card";

type Props = {
  team: Team;
  employees: Employee[];
}

function TeamColumn({ team, employees }: Props) {
  const { setNodeRef } = useDroppable({ id: team.id });

  return (
    <Card ref={setNodeRef} className="border rounded p-4 min-w-64 gap-1">
      <h2 className="font-bold mb-2">{team.name}</h2>
      <AnimatePresence mode="popLayout">
      {employees.map((emp) => (
        <EmployeeCard key={emp.id} employee={emp} />
      ))}
      </AnimatePresence>
    </Card>
  );
}

export default TeamColumn