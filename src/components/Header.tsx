'use client'

import { useState, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { toggleSidebar, toggleSettings, setSearchQuery } from '@/lib/features/uiSlice'
import { searchContent, clearSearch } from '@/lib/features/contentSlice'
import { toggleDarkMode } from '@/lib/features/userPreferencesSlice'
import { MagnifyingGlassIcon, Bars3Icon, Cog6ToothIcon, SunIcon, MoonIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { debounce } from 'lodash'
import Image from 'next/image'

export default function Header() {
  const { data: session } = useSession()
  const appDispatch = useAppDispatch()
  const userPreferences = useAppSelector((state) => state.userPreferences)
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      const debouncedFn = debounce(() => {
        appDispatch(setSearchQuery(query))
        if (query.trim()) {
          appDispatch(searchContent({ query }))
        } else {
          appDispatch(clearSearch())
        }
      }, 300)
      debouncedFn()
    },
    [appDispatch]
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearchQuery(value)
    debouncedSearch(value)
  }

  const handleDarkModeToggle = () => {
    appDispatch(toggleDarkMode())
    // Apply theme to document
    if (userPreferences.preferences.darkMode) {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-50"
    >
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => appDispatch(toggleSidebar())}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PC</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
            Content Dashboard
          </h1>
        </div>
      </div>

      {/* Center section - Search */}
      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={localSearchQuery}
            onChange={handleSearchChange}
            placeholder="Search news, music, or social posts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDarkModeToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Toggle dark mode"
        >
          {userPreferences.preferences.darkMode ? (
            <SunIcon className="h-6 w-6" />
          ) : (
            <MoonIcon className="h-6 w-6" />
          )}
        </button>

        <button
          onClick={() => appDispatch(toggleSettings())}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Settings"
        >
          <Cog6ToothIcon className="h-6 w-6" />
        </button>

        <div className="flex items-center space-x-2 ml-4 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                  {session?.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              {session?.user?.name || 'User'}
            </span>
            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {session?.user?.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {session?.user?.email}
                  </p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  )
}
