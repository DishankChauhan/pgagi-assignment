'use client'

import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { reorderContent, moveContentBetweenSections } from '@/lib/features/contentSlice'
import DraggableContentCard from './DraggableContentCard'
import { createPortal } from 'react-dom'

interface DragAndDropProviderProps {
  children: React.ReactNode
}

export default function DragAndDropProvider({ children }: DragAndDropProviderProps) {
  const dispatch = useAppDispatch()
  const { news, social, music, search, trending } = useAppSelector((state) => state.content)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<any>(null)
  
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

  // Function to find item by ID across all sections
  const findItem = (id: string) => {
    // Search in news
    const newsItem = news.articles.find(article => article.id === id)
    if (newsItem) return { item: newsItem, containerId: 'news' }
    
    // Search in social
    const socialItem = social.posts.find(post => post.id === id)
    if (socialItem) return { item: socialItem, containerId: 'social' }
    
    // Search in music
    const musicItem = music.tracks.find(track => track.id === id)
    if (musicItem) return { item: musicItem, containerId: 'music' }
    
    // Search in search results
    const searchItem = search.results.find(result => result.id === id)
    if (searchItem) return { item: searchItem, containerId: 'search' }
    
    // Search in trending news
    const trendingNewsItem = trending.news.find(article => article.id === id)
    if (trendingNewsItem) return { item: trendingNewsItem, containerId: 'trending' }
    
    // Search in trending music
    const trendingMusicItem = trending.music.find(track => track.id === id)
    if (trendingMusicItem) return { item: trendingMusicItem, containerId: 'trending' }
    
    return null
  }

  function handleDragStart(event: DragStartEvent) {
    console.log('Drag started:', event.active.id)
    setActiveId(event.active.id as string)
    
    // Find the active item to display in overlay
    const found = findItem(event.active.id as string)
    if (found) {
      setActiveItem(found.item)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    console.log('Drag ended:', event)
    setActiveId(null)
    setActiveItem(null)
    const { active, over } = event

    if (!over) {
      console.log('No drop target found')
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    console.log('Drop details:', { 
      activeId, 
      overId, 
      activeData: active.data.current, 
      overData: over.data.current 
    })

    // Get container information
    const activeContainer = active.data.current?.sortable?.containerId as string
    let overContainer = over.data.current?.sortable?.containerId as string

    // If we don't have an overContainer from sortable data, check if we're dropping on a container
    if (!overContainer) {
      if (over.data.current?.type === 'container') {
        overContainer = over.data.current.containerId as string
      } else {
        // Fallback to using the over.id as container ID
        overContainer = over.id as string
      }
    }

    console.log('Containers:', { activeContainer, overContainer })

    if (activeId !== overId) {
      if (activeContainer && overContainer && activeContainer !== overContainer) {
        // Moving between different sections
        console.log('Moving between sections:', activeContainer, '->', overContainer)
        dispatch(moveContentBetweenSections({
          itemId: activeId,
          fromSection: activeContainer,
          toSection: overContainer,
        }))
      } else if (activeContainer && overContainer && activeContainer === overContainer) {
        // Reordering within the same container
        console.log('Reordering within same container:', activeContainer)
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
        {typeof window !== 'undefined' && createPortal(
          <DragOverlay>
            {activeId && activeItem ? (
              <div className="transform rotate-3 scale-105 opacity-95 shadow-2xl">
                <DraggableContentCard
                  id={activeId}
                  content={activeItem}
                  containerId="overlay"
                />
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  )
}
