'use client'

import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { setActiveSection } from '@/lib/features/uiSlice'
import { 
  HomeIcon, 
  FireIcon, 
  HeartIcon, 
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

const navigationItems = [
  { id: 'feed', label: 'Personalized Feed', icon: HomeIcon },
  { id: 'trending', label: 'Trending', icon: FireIcon },
  { id: 'favorites', label: 'Favorites', icon: HeartIcon },
  { id: 'search', label: 'Search', icon: MagnifyingGlassIcon },
] as const

export default function Sidebar() {
  const dispatch = useAppDispatch()
  const { sidebarOpen, activeSection } = useAppSelector((state) => state.ui)

  const handleSectionChange = (section: 'feed' | 'trending' | 'favorites' | 'search') => {
    dispatch(setActiveSection(section))
  }

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 pt-16"
        >
          <div className="flex flex-col h-full">
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              <div className="mb-6">
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Navigation
                </h2>
              </div>
              
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={clsx(
                      'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </motion.button>
                )
              })}
            </nav>

            {/* Categories */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Quick Filters
              </h3>
              <div className="space-y-1">
                {['Technology', 'Sports', 'Entertainment', 'Business', 'Health'].map((category) => (
                  <button
                    key={category}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
