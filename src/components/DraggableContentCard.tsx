'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ContentCard from './ContentCard'
import { NewsArticle, SocialPost, SpotifyTrack } from '@/lib/features/contentSlice'

type ContentItem = NewsArticle | SocialPost | SpotifyTrack

interface DraggableContentCardProps {
  content: ContentItem
  id: string
  containerId: string
}

function mapContentToCardProps(content: ContentItem) {
  if ('source' in content) {
    // NewsArticle
    return {
      id: content.id,
      title: content.title,
      description: content.description,
      imageUrl: content.urlToImage,
      source: content.source.name,
      publishedAt: content.publishedAt,
      type: 'news' as const,
      url: content.url,
    }
  } else if ('artists' in content) {
    // SpotifyTrack
    return {
      id: content.id,
      title: content.name,
      description: `by ${content.artists.map(artist => artist.name).join(', ')}`,
      imageUrl: content.album.images?.[0]?.url,
      publishedAt: content.album.release_date,
      type: 'music' as const,
      url: content.external_urls.spotify,
      additionalInfo: {
        album: content.album.name,
        duration: content.duration_ms,
        popularity: content.popularity,
      },
    }
  } else {
    // SocialPost
    return {
      id: content.id,
      title: `${content.user.name} (@${content.user.username})`,
      description: content.text,
      imageUrl: content.user.profile_image_url,
      publishedAt: content.created_at,
      type: 'social' as const,
      additionalInfo: {
        like_count: content.public_metrics?.like_count,
        retweet_count: content.public_metrics?.retweet_count,
        user: {
          name: content.user.name,
          username: content.user.username,
        },
      },
    }
  }
}

export default function DraggableContentCard({ content, id, containerId }: DraggableContentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    data: {
      content,
      type: 'source' in content ? 'news' : 'artists' in content ? 'music' : 'social',
      sortable: {
        containerId: containerId,
        index: 0 // This will be managed by dnd-kit
      }
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

  const cardProps = mapContentToCardProps(content)

  // Get type icon for the drag handle
  const getTypeIcon = () => {
    if ('source' in content) return '📰'
    if ('artists' in content) return '🎵'
    return '💬'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        touch-none cursor-grab active:cursor-grabbing group
        transform transition-all duration-300 ease-out
        ${isDragging 
          ? 'shadow-2xl ring-4 ring-blue-400 ring-opacity-60 scale-105 rotate-2 z-50' 
          : 'hover:scale-[1.02] hover:shadow-lg hover:-translate-y-1 z-10'
        }
      `}
    >
      <div className="relative">
        {/* Enhanced drag handle indicator */}
        <div className={`absolute top-3 right-3 transition-all duration-200 z-20 ${
          isDragging ? 'opacity-100 scale-110' : 'opacity-30 group-hover:opacity-70 scale-90'
        }`}>
          <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-md border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-1">
              <span className="text-xs">{getTypeIcon()}</span>
              <div className="flex flex-col space-y-0.5">
                <div className="flex space-x-0.5">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
                <div className="flex space-x-0.5">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
                <div className="flex space-x-0.5">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dragging indicator overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900 bg-opacity-20 rounded-lg pointer-events-none z-10 flex items-center justify-center">
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              Moving...
            </div>
          </div>
        )}

        <div className={`rounded-lg overflow-hidden ${
          isDragging ? 'ring-2 ring-blue-300' : ''
        }`}>
          <ContentCard {...cardProps} />
        </div>
      </div>
    </div>
  )
}
