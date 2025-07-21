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
    data: {
      type: 'container',
      containerId: id
    }
  })

  const itemIds = items.map(item => item.id)

  // Enhanced styling for better visual feedback
  const getContainerStyle = () => {
    if (isOver) {
      return 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 scale-[1.02] shadow-xl border-2'
    }
    return 'border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md border-2 border-dashed'
  }

  const getHeaderIcon = () => {
    switch (id) {
      case 'news': return '📰'
      case 'social': return '💬'
      case 'music': return '🎵'
      case 'search': return '🔍'
      case 'trending': return '🔥'
      default: return '📋'
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] p-4 rounded-xl transition-all duration-300 ease-out ${getContainerStyle()}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
          isOver 
            ? 'text-blue-800 dark:text-blue-200 scale-105' 
            : 'text-gray-900 dark:text-white'
        }`}>
          <span className={`text-xl transition-transform duration-300 ${isOver ? 'animate-bounce' : ''}`}>
            {getHeaderIcon()}
          </span>
          <span>{title}</span>
          {isOver && <span className="animate-pulse">📥</span>}
        </h3>
        <div className={`text-sm px-2 py-1 rounded-full transition-all duration-200 ${
          isOver 
            ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
          {items.length} item{items.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-4" data-sortable-container={id}>
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-12 rounded-lg transition-all duration-300 ${
                isOver 
                  ? 'bg-blue-100 dark:bg-blue-900/20 scale-105' 
                  : 'bg-gray-100 dark:bg-gray-800/50'
              }`}
            >
              <motion.div
                animate={isOver ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.5, repeat: isOver ? Infinity : 0 }}
                className="text-6xl mb-4"
              >
                {isOver ? '🎯' : getHeaderIcon()}
              </motion.div>
              <p className={`font-medium transition-colors ${
                isOver 
                  ? 'text-blue-700 dark:text-blue-300' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {isOver 
                  ? 'Drop your content here!' 
                  : 'Drag content here to organize'
                }
              </p>
              {isOver && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-blue-600 dark:text-blue-400 mt-2"
                >
                  Release to move content to {title}
                </motion.p>
              )}
            </motion.div>
          ) : (
            items.map((item) => (
              <DraggableContentCard
                key={item.id}
                id={item.id}
                content={item}
                containerId={id}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}
