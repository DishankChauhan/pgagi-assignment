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
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

  const cardProps = mapContentToCardProps(content)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        touch-none cursor-grab active:cursor-grabbing 
        transform transition-all duration-200 hover:scale-[1.02] 
        ${isDragging ? 'shadow-2xl ring-2 ring-blue-500 opacity-90' : 'hover:shadow-lg'}
        ${isDragging ? 'z-50' : 'z-10'}
      `}
    >
      <div className="relative">
        {/* Drag handle indicator */}
        <div className="absolute top-2 right-2 opacity-40 hover:opacity-80 transition-opacity z-10">
          <div className="flex flex-col space-y-1">
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          </div>
        </div>
        <ContentCard {...cardProps} />
      </div>
    </div>
  )
}
