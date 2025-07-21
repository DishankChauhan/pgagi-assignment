'use client'

import { useMemo } from 'react'
import { useAppSelector } from '@/lib/hooks'
import ContentCard from '../ContentCard'
import { NewsArticle, SocialPost, SpotifyTrack } from '@/lib/features/contentSlice'

export default function FavoritesSection() {
  const { favoriteContent } = useAppSelector((state) => state.userPreferences.preferences)
  const { news, music, social } = useAppSelector((state) => state.content)

  // Get all content that's been favorited
  const favoriteItems = useMemo(() => {
    const allContent = [
      ...news.articles.map((article: NewsArticle) => ({
        ...article,
        type: 'news' as const,
        imageUrl: article.urlToImage,
        additionalInfo: undefined, // Ensure additionalInfo exists for news
      })),
      ...music.tracks.map((track: SpotifyTrack) => ({
        id: track.id,
        title: track.name,
        description: `${track.artists.map(a => a.name).join(', ')} • ${track.album.name}`,
        type: 'music' as const,
        imageUrl: track.album.images[0]?.url,
        publishedAt: track.album.release_date,
        url: track.external_urls.spotify,
        additionalInfo: {
          album: track.album.name,
          duration: track.duration_ms,
          popularity: track.popularity,
        },
      })),
      ...social.posts.map((post: SocialPost) => ({
        ...post,
        title: post.text.slice(0, 50) + '...',
        description: post.text,
        type: 'social' as const,
        imageUrl: post.user?.profile_image_url, // Add imageUrl for social posts
        publishedAt: post.created_at,
        additionalInfo: {
          like_count: post.public_metrics?.like_count,
          retweet_count: post.public_metrics?.retweet_count,
          user: post.user,
        },
      })),
    ]

    return allContent.filter(item => favoriteContent.includes(item.id))
  }, [favoriteContent, news.articles, music.tracks, social.posts])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          ❤️ Your Favorites
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {favoriteItems.length} favorite{favoriteItems.length !== 1 ? 's' : ''}
        </span>
      </div>

      {favoriteItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteItems.map((item) => (
            <ContentCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              imageUrl={item.imageUrl}
              source={item.type === 'news' ? (item as NewsArticle).source?.name : undefined}
              publishedAt={item.publishedAt}
              type={item.type}
              url={item.type === 'news' ? (item as NewsArticle).url : item.type === 'music' ? item.url : undefined}
              additionalInfo={item.additionalInfo}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💔</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Start exploring content and click the heart icon on items you love to see them here.
          </p>
        </div>
      )}
    </div>
  )
}
