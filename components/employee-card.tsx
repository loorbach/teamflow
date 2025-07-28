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
      className="text-sm px-4 py-1 border rounded shadow mb-2 flex justify-between items-center cursor-grab active:cursor-grabbing select-none hover:border-blue-400 transition-colors duration-200"
    >
      <div>{employee.firstName.substring(0, 1)}. {employee.lastName}</div>
      <div className="text-xs text-gray-500">{employee.roleId}</div>
      <div className="text-xs text-gray-500">{employee.fte} FTE</div>
    </motion.div>
  );
}

export default EmployeeCard;
