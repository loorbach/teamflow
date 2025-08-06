'use client'

import { cn } from '@/lib/utils'
import { useDroppable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { Trash } from 'lucide-react'

type Props = {
  visible: boolean
}

export default function TrashZone({ visible }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: 'trash' })

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0, y: 30 }}
      transition={{ duration: 0.2 }}
      ref={setNodeRef}
      className={cn(
        'fixed bottom-4 right-4 h-[100px] w-[150px] flex items-center justify-center rounded-md border-4 border-dashed text-sm transition-colors duration-200',
        'bg-popover text-destructive border-destructive',
        isOver && 'border-red-600/80 dark:border-red-400/80 bg-destructive/10'
      )}
    >
      <Trash
        className={cn('size-8 z-10 transition-transform duration-200', isOver && 'scale-110')}
      />
      <span className="sr-only">Trash zone</span>
    </motion.div>
  )
}
