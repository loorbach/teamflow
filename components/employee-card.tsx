"use client"

import { Employee } from "@/db/types";
import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";

type Props = {
  employee: Employee;
}

function EmployeeCard({ employee }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: employee.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`,
        transition: "transform 0.001s",
        willChange: "transform",
        zIndex: 50,
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
      }
    : undefined;

  return (
    <motion.div 
      layout
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1}}
      transition={{ duration: 0.2}}
      className="p-2 border rounded bg-white shadow mb-2 cursor-grab active:cursor-grabbing select-none"
    >
      <div>{employee.firstName} {employee.lastName}</div>
      <div className="text-xs text-gray-500">{employee.fte} FTE</div>
    </motion.div>
  );
}

export default EmployeeCard;
