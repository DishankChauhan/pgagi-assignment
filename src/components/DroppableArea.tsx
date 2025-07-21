'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import DraggableContentCard from './DraggableContentCard'
import { NewsArticle, SocialPost, SpotifyTrack } from '@/lib/features/contentSlice'

type ContentItem = NewsArticle | SocialPost | SpotifyTrack

interface DroppableAreaProps {
  id: string
  title: string
  items: ContentItem[]
  onReorder?: (activeId: string, overId: string) => void
}

export default function DroppableArea({ id, title, items }: DroppableAreaProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] p-4 rounded-lg border-2 border-dashed transition-colors ${
        isOver
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
      }`}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <p className="text-gray-500 dark:text-gray-400">
                Drag content here to organize
              </p>
            </motion.div>
          ) : (
            items.map((item) => (
              <DraggableContentCard
                key={item.id}
                id={item.id}
                content={item}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}
