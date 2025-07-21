'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { toggleSettings } from '@/lib/features/uiSlice'
import { 
  updateCategories, 
  updateMusicGenres,
  toggleDarkMode, 
  setLanguage,
  toggleAutoRefresh,
  setRefreshInterval,
  toggleNotifications,
  setFeedLayout,
  toggleContentType
} from '@/lib/features/userPreferencesSlice'
import { XMarkIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
]

export default function SettingsPanel() {
  const dispatch = useAppDispatch()
  const { settingsOpen } = useAppSelector((state) => state.ui)
  const { preferences, availableCategories, availableMusicGenres } = useAppSelector((state) => state.userPreferences)
  
  const [selectedCategories, setSelectedCategories] = useState(preferences.favoriteCategories)
  const [selectedMusicGenres, setSelectedMusicGenres] = useState(preferences.musicGenres)
  const [activeTab, setActiveTab] = useState('categories')

  const handleCategoryToggle = (category: string) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c: string) => c !== category)
      : [...selectedCategories, category]
    
    setSelectedCategories(updatedCategories)
    dispatch(updateCategories(updatedCategories))
  }

  const handleMusicGenreToggle = (genre: string) => {
    const updatedGenres = selectedMusicGenres.includes(genre)
      ? selectedMusicGenres.filter((g: string) => g !== genre)
      : [...selectedMusicGenres, genre]
    
    setSelectedMusicGenres(updatedGenres)
    dispatch(updateMusicGenres(updatedGenres))
  }

  const handleLanguageChange = (languageCode: string) => {
    dispatch(setLanguage(languageCode))
  }

  const handleDarkModeToggle = () => {
    dispatch(toggleDarkMode())
    // Apply theme to document
    if (preferences.darkMode) {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }

  return (
    <AnimatePresence>
      {settingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => dispatch(toggleSettings())}
          />

          {/* Settings Panel */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Settings
                </h2>
                <button
                  onClick={() => dispatch(toggleSettings())}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {[
                  { id: 'categories', label: 'Content' },
                  { id: 'appearance', label: 'Display' },
                  { id: 'notifications', label: 'Alerts' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Categories Tab */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  {/* News Categories */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Favorite News Categories
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {availableCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryToggle(category)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            selectedCategories.includes(category)
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-300'
                          }`}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Music Genres */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Favorite Music Genres
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {availableMusicGenres.map((genre) => (
                        <button
                          key={genre}
                          onClick={() => handleMusicGenreToggle(genre)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            selectedMusicGenres.includes(genre)
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-300'
                          }`}
                        >
                          {genre.charAt(0).toUpperCase() + genre.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content Types */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Content Types
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(preferences.contentTypes).map(([type, enabled]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300 capitalize">
                            {type}
                          </span>
                          <button
                            onClick={() => dispatch(toggleContentType(type as keyof typeof preferences.contentTypes))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  {/* Dark Mode */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Dark Mode
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Toggle between light and dark themes
                      </p>
                    </div>
                    <button
                      onClick={handleDarkModeToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Feed Layout */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Feed Layout
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => dispatch(setFeedLayout('grid'))}
                        className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                          preferences.feedLayout === 'grid'
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <Squares2X2Icon className="h-4 w-4 mr-2" />
                        Grid
                      </button>
                      <button
                        onClick={() => dispatch(setFeedLayout('list'))}
                        className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                          preferences.feedLayout === 'list'
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <ListBulletIcon className="h-4 w-4 mr-2" />
                        List
                      </button>
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Language
                    </h3>
                    <select
                      value={preferences.language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {availableLanguages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  {/* Auto Refresh */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Auto Refresh
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Automatically refresh content
                      </p>
                    </div>
                    <button
                      onClick={() => dispatch(toggleAutoRefresh())}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.autoRefresh ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Refresh Interval */}
                  {preferences.autoRefresh && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Refresh Interval (minutes)
                      </h3>
                      <input
                        type="range"
                        min="1"
                        max="60"
                        value={preferences.refreshInterval}
                        onChange={(e) => dispatch(setRefreshInterval(Number(e.target.value)))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>1 min</span>
                        <span className="font-medium">{preferences.refreshInterval} min</span>
                        <span>60 min</span>
                      </div>
                    </div>
                  )}

                  {/* Push Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Push Notifications
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive notifications for new content
                      </p>
                    </div>
                    <button
                      onClick={() => dispatch(toggleNotifications())}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
