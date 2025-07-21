'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ContentCard from './ContentCard'
import { NewsArticle, SocialPost, SpotifyTrack } from '@/lib/features/contentSlice'

type ContentItem = NewsArticle | SocialPost | SpotifyTrack

interface DraggableContentCardProps {
  content: ContentItem
  id: string
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

export default function DraggableContentCard({ content, id }: DraggableContentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const cardProps = mapContentToCardProps(content)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <ContentCard {...cardProps} />
    </div>
  )
}
