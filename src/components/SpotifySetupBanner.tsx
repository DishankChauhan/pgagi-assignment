'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SpotifySetupBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg mb-6 relative"
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
        
        <div className="flex items-start space-x-3">
          <div className="text-2xl">🎵</div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">
              Real Spotify Data Available!
            </h3>
            <p className="text-sm opacity-90 mb-2">
              Currently showing demo music data. Get real songs, artists, and playlists by setting up Spotify API credentials.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://developer.spotify.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
              >
                📖 Get Credentials
              </a>
              <a
                href="/SPOTIFY_SETUP_GUIDE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
              >
                📋 Setup Guide
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
