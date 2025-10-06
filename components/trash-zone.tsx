'use client'

import { cn } from '@/lib/utils'
import { CollisionPriority } from '@dnd-kit/abstract'
import { useDroppable } from '@dnd-kit/react'
import { motion } from 'framer-motion'
import { Trash } from 'lucide-react'

type Props = {
  visible: boolean
}

export default function TrashZone({ visible }: Props) {
  const { ref, isDropTarget } = useDroppable({
    id: 'trash',
    type: 'trash',
    accept: 'employee',
    collisionPriority: CollisionPriority.Lowest,
  })

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0, y: 30 }}
      transition={{ duration: 0.2 }}
      ref={ref}
      className={cn(
        'fixed bottom-4 right-4 h-[100px] w-[150px] flex items-center justify-center rounded-md border-4 border-dashed text-sm transition-colors duration-200',
        'bg-popover text-destructive border-destructive',
        isDropTarget && 'border-red-600/80 dark:border-red-400/80 bg-destructive/10'
      )}
    >
      <Trash
        className={cn('size-8 z-10 transition-transform duration-200', isDropTarget && 'scale-110')}
      />
      <span className="sr-only">Trash zone</span>
    </motion.div>
  )
}
