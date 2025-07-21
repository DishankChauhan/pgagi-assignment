'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { addToFavorites, removeFromFavorites } from '@/lib/features/userPreferencesSlice'
import { HeartIcon, ShareIcon, EyeIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface ContentCardProps {
  id: string
  title: string
  description: string
  imageUrl?: string
  source?: string
  publishedAt?: string
  type: 'news' | 'social' | 'music'
  url?: string
  additionalInfo?: {
    vote_average?: number
    like_count?: number
    retweet_count?: number
    album?: string
    duration?: number
    popularity?: number
    user?: {
      name: string
      username: string
    }
  }
}

export default function ContentCard({
  id,
  title,
  description,
  imageUrl,
  source,
  publishedAt,
  type,
  url,
  additionalInfo
}: ContentCardProps) {
  const dispatch = useAppDispatch()
  const favoriteContent = useAppSelector((state) => state.userPreferences.preferences.favoriteContent)
  const [imageError, setImageError] = useState(false)
  
  const isFavorite = favoriteContent.includes(id)

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(id))
    } else {
      dispatch(addToFavorites(id))
    }
  }

  const handleCardClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTypeColor = () => {
    switch (type) {
      case 'news': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'social': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'music': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer card-hover"
      onClick={handleCardClick}
    >
      {/* Image */}
      {imageUrl && !imageError && (
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={true}
          />
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor()}`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {title}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleFavoriteToggle()
            }}
            className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
          {description}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            {source && <span>{source}</span>}
            {publishedAt && <span>• {formatDate(publishedAt)}</span>}
          </div>
          
          {/* Additional info based on type */}
          {type === 'social' && additionalInfo && (
            <div className="flex items-center space-x-3">
              {additionalInfo.like_count && (
                <span>❤️ {additionalInfo.like_count}</span>
              )}
              {additionalInfo.retweet_count && (
                <span>🔄 {additionalInfo.retweet_count}</span>
              )}
            </div>
          )}

          {type === 'music' && additionalInfo && (
            <div className="flex items-center space-x-3 text-sm">
              {additionalInfo.album && (
                <span className="text-gray-600 dark:text-gray-300">
                  📀 {additionalInfo.album}
                </span>
              )}
              {additionalInfo.popularity && (
                <span className="text-green-600">
                  🎵 {additionalInfo.popularity}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Social post user info */}
        {type === 'social' && additionalInfo?.user && (
          <div className="mt-3 flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">
                {additionalInfo.user.name.charAt(0)}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {additionalInfo.user.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                @{additionalInfo.user.username}
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex items-center justify-between">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              handleCardClick()
            }}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors"
          >
            {type === 'news' ? 'Read More' : type === 'music' ? 'Listen on Spotify' : 'View Post'}
          </button>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
            <button 
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
