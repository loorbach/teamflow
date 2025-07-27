"use client";

import DnDContainer from "@/components/dnd-container";
import type { Employee, Team } from "../db/types";

type Props = {
  teams: Team[];
  employees: Employee[];
};

export default function HomeClient({ teams, employees }: Props) {
  return <DnDContainer teams={teams} employees={employees} />;
}
