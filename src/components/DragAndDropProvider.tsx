'use client'

import { useState } from 'react'
import { DndContext, closestCenter, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay, DragOverEvent, CollisionDetection } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { reorderContent, moveContentBetweenSections, NewsArticle, SocialPost, SpotifyTrack } from '@/lib/features/contentSlice'
import DraggableContentCard from './DraggableContentCard'
import { createPortal } from 'react-dom'

interface DragAndDropProviderProps {
  children: React.ReactNode
}

export default function DragAndDropProvider({ children }: DragAndDropProviderProps) {
  const dispatch = useAppDispatch()
  const { news, social, music, search, trending } = useAppSelector((state) => state.content)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<NewsArticle | SocialPost | SpotifyTrack | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [overContainer, setOverContainer] = useState<string | null>(null)

  function handleDragOver(event: DragOverEvent) {
    const { over } = event
    const overId = over?.id as string

    // Track which container we're over for better visual feedback
    if (over?.data.current?.type === 'container') {
      setOverContainer(over.data.current.containerId || overId)
    } else if (over?.data.current?.sortable?.containerId) {
      setOverContainer(over.data.current.sortable.containerId)
    } else {
      setOverContainer(null)
    }
  }
  
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

  // Custom collision detection that prioritizes containers
  const customCollisionDetection: CollisionDetection = (args) => {
    // First check for container collisions
    const containerCollisions = closestCorners(args)
    if (containerCollisions.length > 0) {
      return containerCollisions
    }
    
    // Fallback to closest center
    return closestCenter(args)
  }

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
    console.log('🎯 Drag ended:', event)
    setActiveId(null)
    setActiveItem(null)
    setOverContainer(null)
    const { active, over } = event

    if (!over) {
      console.log('❌ No drop target found')
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    console.log('🎯 Drop details:', { 
      activeId, 
      overId, 
      activeData: active.data.current, 
      overData: over.data.current 
    })

    // Get container information
    const activeContainer = active.data.current?.sortable?.containerId as string
    let overContainer: string | null = null

    // Priority 1: Check if dropping directly on a container
    if (over.data.current?.type === 'container') {
      overContainer = over.data.current.containerId || overId
      console.log('🎯 Dropping on container:', overContainer)
    }
    // Priority 2: Check sortable container info
    else if (over.data.current?.sortable?.containerId) {
      overContainer = over.data.current.sortable.containerId
      console.log('🎯 Dropping on sortable item in container:', overContainer)
    }
    // Priority 3: Try to infer from the over.id
    else {
      // Check if over.id matches a known container
      const knownContainers = ['news', 'social', 'music', 'search', 'trending']
      if (knownContainers.includes(overId)) {
        overContainer = overId
        console.log('🎯 Inferred container from overId:', overContainer)
      } else {
        // Find which container the item belongs to
        const foundItem = findItem(overId)
        if (foundItem) {
          overContainer = foundItem.containerId
          console.log('🎯 Found container by searching items:', overContainer)
        }
      }
    }

    console.log('🎯 Final containers:', { activeContainer, overContainer })

    if (!activeContainer || !overContainer) {
      console.log('❌ Missing container information')
      return
    }

    if (activeId !== overId) {
      if (activeContainer !== overContainer) {
        // Moving between different sections
        console.log('🔄 Moving between sections:', activeContainer, '->', overContainer)
        dispatch(moveContentBetweenSections({
          itemId: activeId,
          fromSection: activeContainer,
          toSection: overContainer,
        }))
      } else {
        // Reordering within the same container
        console.log('🔄 Reordering within same container:', activeContainer)
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
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {children}
        {typeof window !== 'undefined' && createPortal(
          <DragOverlay>
            {activeId && activeItem ? (
              <div className="transform rotate-3 scale-110 opacity-95 shadow-2xl">
                <div className="relative">
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-sm opacity-75"></div>
                  
                  {/* Content container */}
                  <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-blue-400">
                    {/* Moving indicator */}
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10 shadow-lg">
                      Moving
                    </div>
                    
                    <DraggableContentCard
                      id={activeId}
                      content={activeItem}
                      containerId="overlay"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  )
}
