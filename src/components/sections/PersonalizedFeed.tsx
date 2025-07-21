'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchNews, fetchSocialPosts, fetchMusic } from '@/lib/features/contentSlice'
import { useAutoRefresh, useRealTimeUpdates } from '@/lib/hooks/useAutoRefresh'
import DragAndDropProvider from '../DragAndDropProvider'
import DroppableArea from '../DroppableArea'
import LoadingSpinner from '../LoadingSpinner'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'

export default function PersonalizedFeed() {
  const dispatch = useAppDispatch()
  const { news, social, music } = useAppSelector((state) => state.content)
  const { favoriteCategories, musicGenres, autoRefresh } = useAppSelector((state) => state.userPreferences.preferences)
  const [currentPage, setCurrentPage] = useState({ news: 1, music: 1 })
  
  // Auto-refresh and real-time updates
  const { refreshContent } = useAutoRefresh()
  useRealTimeUpdates()
  
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  // Load initial content
  useEffect(() => {
    if (news.articles.length === 0) {
      dispatch(fetchNews({ categories: favoriteCategories, page: 1 }))
    }
    if (social.posts.length === 0) {
      dispatch(fetchSocialPosts({ hashtag: 'technology' }))
    }
    if (music.tracks.length === 0) {
      dispatch(fetchMusic({ type: 'top', page: 1 }))
    }
  }, [dispatch, favoriteCategories, musicGenres, news.articles.length, social.posts.length, music.tracks.length])

  // Load more content when scrolling
  useEffect(() => {
    if (inView && !news.isLoading && news.hasMore) {
      const nextPage = currentPage.news + 1
      dispatch(fetchNews({ categories: favoriteCategories, page: nextPage }))
      setCurrentPage(prev => ({ ...prev, news: nextPage }))
    }
  }, [inView, news.isLoading, news.hasMore, dispatch, favoriteCategories, currentPage.news])

  const handleRefresh = () => {
    refreshContent()
    setCurrentPage({ news: 1, music: 1 })
  }

  if (news.isLoading && news.articles.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Personalized Feed
          </h2>
          {autoRefresh && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center space-x-1 text-green-600 dark:text-green-400 text-sm"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Live</span>
            </motion.div>
          )}
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      <DragAndDropProvider>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* News Section */}
          <DroppableArea
            id="news"
            title="Latest News"
            items={news.articles.slice(0, 6)}
          />

          {/* Social Posts Section */}
          <DroppableArea
            id="social"
            title="Social Buzz"
            items={social.posts.slice(0, 6)}
          />

          {/* Music Section */}
          <DroppableArea
            id="music"
            title="Trending Music"
            items={music.tracks.slice(0, 6)}
          />
        </div>
      </DragAndDropProvider>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-8">
        {news.isLoading && <LoadingSpinner />}
      </div>

      {/* No more content message */}
      {!news.hasMore && news.articles.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <p className="text-gray-500 dark:text-gray-400">
            You&apos;ve reached the end of your personalized feed
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
