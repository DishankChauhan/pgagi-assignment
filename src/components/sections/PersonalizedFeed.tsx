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
      dispatch(fetchMusic({ type: 'top', page: 1, forceFresh: true }))
    }
  }, [dispatch, favoriteCategories, musicGenres, news.articles.length, social.posts.length, music.tracks.length])

  // Load more news when scrolling
  useEffect(() => {
    if (newsInView && !news.isLoading && news.hasMore && currentPage.news === news.page) {
      const nextPage = currentPage.news + 1
      console.log(`📰 Loading more news - page ${nextPage}`)
      dispatch(fetchNews({ categories: favoriteCategories, page: nextPage }))
      setCurrentPage(prev => ({ ...prev, news: nextPage }))
    }
  }, [newsInView, news.isLoading, news.hasMore, news.page, dispatch, favoriteCategories, currentPage.news])

  // Load more music when scrolling
  useEffect(() => {
    if (musicInView && !music.isLoading && music.hasMore && currentPage.music === music.page) {
      const nextPage = currentPage.music + 1
      console.log(`🎵 Loading more music - page ${nextPage}`)
      dispatch(fetchMusic({ type: 'top', page: nextPage }))
      setCurrentPage(prev => ({ ...prev, music: nextPage }))
    }
  }, [musicInView, music.isLoading, music.hasMore, music.page, dispatch, currentPage.music])

  const handleRefresh = () => {
    // Reset pagination state first
    setCurrentPage({ news: 1, music: 1 })
    // Then refresh content
    refreshContent()
  }

  const handleForceRefreshMusic = () => {
    console.log('🔄 Force refreshing music data...')
    // Clear any existing music data first
    dispatch({ type: 'content/clearMusic' })
    // Then fetch fresh data
    dispatch(fetchMusic({ type: 'top', page: 1, forceFresh: true }))
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
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
          <button 
            onClick={handleForceRefreshMusic}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            🎵 Fresh Music
          </button>
        </div>
      </div>

      {/* Enhanced Drag and Drop Instructions */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm"
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
              🎯 Drag & Drop Organization
            </h3>
            <p className="text-blue-800 dark:text-blue-300 text-sm leading-relaxed">
              <strong>Organize your content easily!</strong> Drag any card between sections to reorganize your feed. 
              Cards will automatically adapt to their new section type. Try moving music to news or social posts to trending!
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                📰 News
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
                💬 Social
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                🎵 Music
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <DragAndDropProvider>
        <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-8">
          {/* News Section */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DroppableArea
              id="news"
              title="Latest News"
              items={news.articles}
            />
            {/* News infinite scroll trigger */}
            <div ref={loadMoreNewsRef} className="flex justify-center py-4">
              {news.isLoading && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-3 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg border border-blue-200 dark:border-blue-700"
                >
                  <LoadingSpinner />
                  <span className="text-sm font-medium">Loading more news...</span>
                </motion.div>
              )}
            </div>
            {!news.hasMore && news.articles.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div className="text-3xl mb-2">📰</div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  All caught up with news!
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                  Check back later for updates
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Social Posts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DroppableArea
              id="social"
              title="Social Buzz"
              items={social.posts}
            />
          </motion.div>

          {/* Music Section */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DroppableArea
              id="music"
              title="Trending Music"
              items={music.tracks}
            />
            {/* Music infinite scroll trigger */}
            <div ref={loadMoreMusicRef} className="flex justify-center py-4">
              {music.isLoading && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-3 text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg border border-green-200 dark:border-green-700"
                >
                  <LoadingSpinner />
                  <span className="text-sm font-medium">Loading more music...</span>
                </motion.div>
              )}
            </div>
            {!music.hasMore && music.tracks.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div className="text-3xl mb-2">🎵</div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  All songs loaded!
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                  Discover more in trending music
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </DragAndDropProvider>
    </motion.div>
  )
}
