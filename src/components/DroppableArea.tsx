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

  const itemIds = items.map(item => item.id)

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] p-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
        isOver
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="text-4xl mb-2">📋</div>
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
