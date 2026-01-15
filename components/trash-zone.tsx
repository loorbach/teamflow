'use client';

import { cn } from '@/lib/utils';
import { CollisionPriority } from '@dnd-kit/abstract';
import { useDroppable } from '@dnd-kit/react';
import { Trash } from 'lucide-react';

type Props = {
  visible: boolean;
};

export default function TrashZone({ visible }: Props) {
  const { ref, isDropTarget } = useDroppable({
    id: 'trash',
    type: 'trash',
    accept: 'employee',
    collisionPriority: CollisionPriority.Lowest,
  });

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className={cn(
        'fixed bottom-4 right-4 h-[100px] w-[200px] flex items-center justify-center rounded-md border-2 border-dashed text-sm transition-transform duration-200 ease-out',
        'bg-destructive/10 text-destructive border-destructive',
        isDropTarget && 'border-red-600/80 dark:border-red-400/80 scale-110',
      )}
    >
      <Trash
        className={cn(
          'size-8 z-10 transition-transform ease-out duration-150',
          isDropTarget && 'scale-110',
        )}
      />
      <span className="sr-only">Trash zone</span>
    </div>
  );
}
