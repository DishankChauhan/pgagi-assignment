'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { searchContent, clearSearch, NewsArticle, SocialPost, SpotifyTrack } from '@/lib/features/contentSlice'
import ContentCard from '../ContentCard'
import LoadingSpinner from '../LoadingSpinner'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

type SearchResultItem = NewsArticle | SocialPost | SpotifyTrack

export default function SearchSection() {
  const dispatch = useAppDispatch()
  const { search } = useAppSelector((state) => state.content)
  const [localQuery, setLocalQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (localQuery.trim()) {
      dispatch(searchContent({ query: localQuery.trim() }))
    }
  }

  const handleClearSearch = () => {
    setLocalQuery('')
    dispatch(clearSearch())
  }

  const renderSearchResult = (item: SearchResultItem) => {
    // Type guards to determine content type
    const isNews = (item: SearchResultItem): item is NewsArticle => {
      return 'url' in item && 'source' in item && 'urlToImage' in item
    }
    
    const isMusic = (item: SearchResultItem): item is SpotifyTrack => {
      return 'artists' in item && 'album' in item && 'external_urls' in item
    }
    
    const isSocial = (item: SearchResultItem): item is SocialPost => {
      return 'text' in item && 'user' in item
    }

    if (isNews(item)) {
      return (
        <ContentCard
          key={item.id}
          id={item.id}
          title={item.title}
          description={item.description || 'No description available'}
          imageUrl={item.urlToImage}
          source={item.source.name}
          publishedAt={item.publishedAt}
          type="news"
          url={item.url}
        />
      )
    } else if (isMusic(item)) {
      return (
        <ContentCard
          key={item.id}
          id={item.id}
          title={item.name}
          description={`${item.artists.map(a => a.name).join(', ')} • ${item.album.name}`}
          imageUrl={item.album.images[0]?.url}
          publishedAt={item.album.release_date}
          type="music"
          url={item.external_urls.spotify}
          additionalInfo={{
            album: item.album.name,
            duration: item.duration_ms,
            popularity: item.popularity,
          }}
        />
      )
    } else if (isSocial(item)) {
      return (
        <ContentCard
          key={item.id}
          id={item.id}
          title={`@${item.user.username}`}
          description={item.text || 'No text available'}
          imageUrl={item.user.profile_image_url}
          publishedAt={item.created_at}
          type="social"
          additionalInfo={{
            like_count: item.public_metrics?.like_count,
            retweet_count: item.public_metrics?.retweet_count,
            user: item.user,
          }}
        />
      )
    }

    // Fallback
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🔍 Search Content
        </h2>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search for news, music, or any content..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={!localQuery.trim() || search.isLoading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Search
        </button>
        {search.results.length > 0 && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="px-4 py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Clear search"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </form>

      {/* Search Results */}
      {search.isLoading && <LoadingSpinner />}

      {search.error && (
        <div className="text-center py-8">
          <p className="text-red-500 dark:text-red-400">
            Error searching content: {search.error}
          </p>
        </div>
      )}

      {search.results.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Search Results
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {search.results.length} result{search.results.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {search.results
              .filter(
                (item): item is SearchResultItem =>
                  ('url' in item && 'source' in item && 'urlToImage' in item) ||
                  ('artists' in item && 'album' in item && 'external_urls' in item) ||
                  ('text' in item && 'user' in item)
              )
              .map((item) => renderSearchResult(item))}
          </div>
        </div>
      )}

      {!search.isLoading && !search.error && search.results.length === 0 && search.query && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No results found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Try searching with different keywords or check your spelling.
          </p>
        </div>
      )}

      {!search.query && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Search for content
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Enter keywords to search across news articles, music tracks, and social posts.
          </p>
        </div>
      )}
    </div>
  )
}
