'use client'

import { useAppSelector } from '@/lib/hooks'
import ContentCard from '../ContentCard'
import LoadingSpinner from '../LoadingSpinner'
import { NewsArticle, SpotifyTrack } from '@/lib/features/contentSlice'

export default function TrendingSection() {
  const { trending } = useAppSelector((state) => state.content)

  if (trending.isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Trending Content
      </h2>

      {/* Trending News */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          📰 Trending News
        </h3>
        {trending.news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.news.map((article: NewsArticle, index: number) => (
              <ContentCard
                key={article.id || `news-${index}`}
                id={article.id}
                title={article.title}
                description={article.description}
                imageUrl={article.urlToImage}
                source={article.source?.name}
                publishedAt={article.publishedAt}
                type="news"
                url={article.url}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No trending news available at the moment
            </p>
          </div>
        )}
      </div>

      {/* Trending Music */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          � Trending Music
        </h3>
        {trending.music.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.music.map((track: SpotifyTrack) => (
              <ContentCard
                key={track.id || `trending-music-${track.id}`}
                id={track.id}
                title={track.name}
                description={`${track.artists?.map((a) => a.name).join(', ') || 'Unknown Artist'} • ${track.album?.name || 'Unknown Album'}`}
                imageUrl={track.album.images[0]?.url}
                publishedAt={track.album.release_date}
                type="music"
                url={track.external_urls.spotify}
                additionalInfo={{
                  duration: track.duration_ms,
                  popularity: track.popularity,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No trending music available at the moment
            </p>
          </div>
        )}
      </div>

      {trending.error && (
        <div className="text-center py-8">
          <p className="text-red-500 dark:text-red-400">
            Error loading trending content: {trending.error}
          </p>
        </div>
      )}
    </div>
  )
}
