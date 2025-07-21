'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchNews, fetchMusic, fetchSocialPosts, fetchTrendingContent } from '@/lib/features/contentSlice'
import Header from './Header'
import Sidebar from './Sidebar'
import PersonalizedFeed from './sections/PersonalizedFeed'
import TrendingSection from './sections/TrendingSection'
import FavoritesSection from './sections/FavoritesSection'
import SearchSection from './sections/SearchSection'
import SettingsPanel from './SettingsPanel'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardLayout() {
  const dispatch = useAppDispatch()
  const { activeSection, sidebarOpen } = useAppSelector((state) => state.ui)
  const { preferences } = useAppSelector((state) => state.userPreferences)

  // Initialize dark mode on component mount
  useEffect(() => {
    if (preferences.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [preferences.darkMode])

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchNews({ categories: preferences.favoriteCategories }))
    dispatch(fetchMusic({ page: 1 }))
    dispatch(fetchSocialPosts({ hashtag: 'technology' }))
    dispatch(fetchTrendingContent())
  }, [dispatch, preferences.favoriteCategories])

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'feed':
        return <PersonalizedFeed />
      case 'trending':
        return <TrendingSection />
      case 'favorites':
        return <FavoritesSection />
      case 'search':
        return <SearchSection />
      default:
        return <PersonalizedFeed />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Sidebar />
      
      {/* Main content */}
      <motion.main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        } pt-0`}
        layout
      >
        <div className="container mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderActiveSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>

      <SettingsPanel />

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => dispatch({ type: 'ui/toggleSidebar' })}
        />
      )}
    </div>
  )
}
