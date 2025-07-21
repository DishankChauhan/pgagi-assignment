'use client'

import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { useAppDispatch } from '@/lib/hooks'
import { reorderContent, moveContentBetweenSections } from '@/lib/features/contentSlice'

interface DragAndDropProviderProps {
  children: React.ReactNode
}

export default function DragAndDropProvider({ children }: DragAndDropProviderProps) {
  const dispatch = useAppDispatch()
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId !== overId) {
      // Get container information from data attributes
      const activeContainer = active.data.current?.sortable?.containerId as string
      const overContainer = over.data.current?.sortable?.containerId as string || over.id as string

      console.log('Drag end:', { activeId, overId, activeContainer, overContainer })

      if (activeContainer && overContainer && activeContainer !== overContainer) {
        // Moving between different sections
        dispatch(moveContentBetweenSections({
          itemId: activeId,
          fromSection: activeContainer,
          toSection: overContainer,
        }))
      } else if (activeContainer) {
        // Reordering within the same container
        dispatch(reorderContent({
          section: activeContainer as 'news' | 'social' | 'music' | 'trending' | 'search',
          activeId,
          overId,
        }))
      }
    }
  }

  return (
    <div className={activeId ? 'select-none' : ''}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        {children}
      </DndContext>
    </div>
  )
}
