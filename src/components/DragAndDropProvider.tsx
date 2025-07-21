'use client'

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { useAppDispatch } from '@/lib/hooks'
import { reorderContent, moveContentBetweenSections } from '@/lib/features/contentSlice'

interface DragAndDropProviderProps {
  children: React.ReactNode
}

export default function DragAndDropProvider({ children }: DragAndDropProviderProps) {
  const dispatch = useAppDispatch()
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId !== overId) {
      // Check if we're moving between different containers
      const activeContainer = active.data.current?.sortable?.containerId
      const overContainer = over.data.current?.sortable?.containerId || over.id

      if (activeContainer && overContainer && activeContainer !== overContainer) {
        // Moving between different sections
        dispatch(moveContentBetweenSections({
          itemId: activeId,
          fromSection: activeContainer,
          toSection: overContainer,
        }))
      } else {
        // Reordering within the same container
        dispatch(reorderContent({
          section: activeContainer || 'personalized',
          activeId,
          overId,
        }))
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      {children}
    </DndContext>
  )
}
