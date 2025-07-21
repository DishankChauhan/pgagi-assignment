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
  
  // Separate refs for news and music infinite scroll
  const { ref: loadMoreNewsRef, inView: newsInView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  const { ref: loadMoreMusicRef, inView: musicInView } = useInView({
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

  // Load more news when scrolling
  useEffect(() => {
    if (newsInView && !news.isLoading && news.hasMore) {
      const nextPage = currentPage.news + 1
      dispatch(fetchNews({ categories: favoriteCategories, page: nextPage }))
      setCurrentPage(prev => ({ ...prev, news: nextPage }))
    }
  }, [newsInView, news.isLoading, news.hasMore, dispatch, favoriteCategories, currentPage.news])

  // Load more music when scrolling
  useEffect(() => {
    if (musicInView && !music.isLoading && music.hasMore) {
      const nextPage = currentPage.music + 1
      dispatch(fetchMusic({ type: 'top', page: nextPage }))
      setCurrentPage(prev => ({ ...prev, music: nextPage }))
    }
  }, [musicInView, music.isLoading, music.hasMore, dispatch, currentPage.music])

  const handleRefresh = () => {
    // Reset pagination state first
    setCurrentPage({ news: 1, music: 1 })
    // Then refresh content
    refreshContent()
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

      {/* Drag and Drop Instructions */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      >
        <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">
            💡 Tip: Drag and drop cards between sections to organize your feed! Scroll down to load more content.
          </span>
        </div>
      </motion.div>

      <DragAndDropProvider>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* News Section */}
          <div className="space-y-4">
            <DroppableArea
              id="news"
              title="Latest News"
              items={news.articles.slice(0, 10)}
            />
            {/* News infinite scroll trigger */}
            <div ref={loadMoreNewsRef} className="flex justify-center py-4">
              {news.isLoading && (
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                  <LoadingSpinner />
                  <span className="text-sm">Loading more news...</span>
                </div>
              )}
            </div>
            {!news.hasMore && news.articles.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <div className="text-2xl mb-1">📰</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  All caught up with news!
                </p>
              </motion.div>
            )}
          </div>

          {/* Social Posts Section */}
          <DroppableArea
            id="social"
            title="Social Buzz"
            items={social.posts.slice(0, 8)}
          />

          {/* Music Section */}
          <div className="space-y-4">
            <DroppableArea
              id="music"
              title="Trending Music"
              items={music.tracks.slice(0, 10)}
            />
            {/* Music infinite scroll trigger */}
            <div ref={loadMoreMusicRef} className="flex justify-center py-4">
              {music.isLoading && (
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <LoadingSpinner />
                  <span className="text-sm">Loading more music...</span>
                </div>
              )}
            </div>
            {!music.hasMore && music.tracks.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <div className="text-2xl mb-1">🎵</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  All songs loaded!
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </DragAndDropProvider>
    </motion.div>
  )
}
