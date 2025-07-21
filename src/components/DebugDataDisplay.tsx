'use client'

import { useState } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function DebugDataDisplay() {
  const { music, news, social, search } = useAppSelector((state) => state.content)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'music' | 'news' | 'social' | 'all'>('music')

  // Determine if data is real or demo
  const isRealMusicData = music.tracks.length > 0 && !music.tracks[0]?.name?.includes('[DEMO]')
  const isRealNewsData = news.articles.length > 0 && !news.articles[0]?.title?.includes('Sample')
  const isRealSocialData = social.posts.length > 0 && !social.posts[0]?.text?.includes('mock')

  const dataTypes = [
    { 
      id: 'music', 
      label: `🎵 ${isRealMusicData ? 'Spotify' : 'Demo'}`, 
      count: music.tracks.length, 
      color: 'green',
      status: isRealMusicData ? 'real' : 'demo'
    },
    { 
      id: 'news', 
      label: `📰 ${isRealNewsData ? 'Live' : 'Demo'}`, 
      count: news.articles.length, 
      color: 'blue',
      status: isRealNewsData ? 'real' : 'demo'
    },
    { 
      id: 'social', 
      label: `💬 ${isRealSocialData ? 'Live' : 'Demo'}`, 
      count: social.posts.length, 
      color: 'purple',
      status: isRealSocialData ? 'real' : 'demo'
    },
    { 
      id: 'all', 
      label: '📊 All', 
      count: music.tracks.length + news.articles.length + social.posts.length, 
      color: 'gray',
      status: 'mixed'
    }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'music':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-green-400 font-medium">🎵 Music Tracks: {music.tracks.length}</p>
              <span className={`px-2 py-1 text-xs rounded-full ${
                isRealMusicData 
                  ? 'bg-green-900/30 text-green-300 border border-green-500/30' 
                  : 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30'
              }`}>
                {isRealMusicData ? '✅ Real Data' : '⚠️ Demo Data'}
              </span>
            </div>
            <p className="text-xs text-gray-400">Loading: {music.isLoading ? 'Yes' : 'No'}</p>
            {music.error && <p className="text-red-400 text-xs">❌ Error: {music.error}</p>}
            {music.tracks.slice(0, 3).map((track, idx) => (
              <div key={track.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-green-300 font-medium text-sm">
                      #{idx + 1}: {track.name}
                    </p>
                    <p className="text-gray-300 text-xs mt-1">
                      🎤 {track.artists.map(a => a.name).join(', ')}
                    </p>
                    <p className="text-gray-500 text-xs">
                      💿 {track.album.name}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      ID: {track.id.substring(0, 20)}...
                    </p>
                  </div>
                  {track.album.images?.[0] && (
                    <Image 
                      src={track.album.images[0].url} 
                      alt={track.album.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded object-cover ml-2"
                    />
                  )}
                </div>
                {track.preview_url && (
                  <div className="mt-2 text-xs text-blue-400">
                    🎧 Preview available
                  </div>
                )}
              </div>
            ))}
            {music.tracks.length === 0 && (
              <div className="text-center py-4 text-yellow-400">
                <div className="text-2xl mb-1">🎵</div>
                <p className="text-xs">No tracks loaded yet</p>
              </div>
            )}
            {music.tracks.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                ... and {music.tracks.length - 3} more tracks
              </p>
            )}
          </div>
        )
      case 'news':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-blue-400 font-medium">📰 News Articles: {news.articles.length}</p>
              <span className={`px-2 py-1 text-xs rounded-full ${
                isRealNewsData 
                  ? 'bg-blue-900/30 text-blue-300 border border-blue-500/30' 
                  : 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30'
              }`}>
                {isRealNewsData ? '✅ Live News' : '⚠️ Demo Data'}
              </span>
            </div>
            <p className="text-xs text-gray-400">Loading: {news.isLoading ? 'Yes' : 'No'}</p>
            {news.error && <p className="text-red-400 text-xs">❌ Error: {news.error}</p>}
            {news.articles.slice(0, 2).map((article, idx) => (
              <div key={article.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <p className="text-blue-300 font-medium text-sm">
                  #{idx + 1}: {article.title.length > 50 ? article.title.substring(0, 50) + '...' : article.title}
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  📺 {article.source.name}
                </p>
                <p className="text-gray-500 text-xs">
                  📅 {new Date(article.publishedAt).toLocaleDateString()}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  ID: {article.id.substring(0, 20)}...
                </p>
              </div>
            ))}
            {news.articles.length === 0 && (
              <div className="text-center py-4 text-yellow-400">
                <div className="text-2xl mb-1">📰</div>
                <p className="text-xs">No articles loaded yet</p>
              </div>
            )}
            {news.articles.length > 2 && (
              <p className="text-xs text-gray-500 text-center">
                ... and {news.articles.length - 2} more articles
              </p>
            )}
          </div>
        )
      case 'social':
        return (
          <div className="space-y-2">
            <p className="text-purple-400 font-medium">💬 Social Posts: {social.posts.length}</p>
            <p className="text-xs text-gray-400">Loading: {social.isLoading ? 'Yes' : 'No'}</p>
            {social.error && <p className="text-red-400 text-xs">Error: {social.error}</p>}
            {social.posts.slice(0, 2).map((post, idx) => (
              <div key={post.id} className="bg-gray-800 p-2 rounded text-xs">
                <p className="text-purple-300 font-medium">#{idx + 1}: {post.text.substring(0, 30)}...</p>
                <p className="text-gray-300">By: @{post.user.username}</p>
                <p className="text-gray-500">ID: {post.id.substring(0, 15)}...</p>
              </div>
            ))}
            {social.posts.length === 0 && <p className="text-yellow-400 text-xs">No posts loaded</p>}
          </div>
        )
      case 'all':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-900/30 p-2 rounded border border-green-500/30">
                <div className="flex items-center justify-between">
                  <p className="text-green-400 font-medium">🎵 Music</p>
                  <span className={`w-2 h-2 rounded-full ${isRealMusicData ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                </div>
                <p className="text-white">{music.tracks.length} tracks</p>
                <p className="text-green-300 text-xs">{isRealMusicData ? 'Live Spotify' : 'Demo data'}</p>
              </div>
              <div className="bg-blue-900/30 p-2 rounded border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <p className="text-blue-400 font-medium">📰 News</p>
                  <span className={`w-2 h-2 rounded-full ${isRealNewsData ? 'bg-blue-400' : 'bg-yellow-400'}`}></span>
                </div>
                <p className="text-white">{news.articles.length} articles</p>
                <p className="text-blue-300 text-xs">{isRealNewsData ? 'Live news' : 'Demo data'}</p>
              </div>
              <div className="bg-purple-900/30 p-2 rounded border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <p className="text-purple-400 font-medium">💬 Social</p>
                  <span className={`w-2 h-2 rounded-full ${isRealSocialData ? 'bg-purple-400' : 'bg-yellow-400'}`}></span>
                </div>
                <p className="text-white">{social.posts.length} posts</p>
                <p className="text-purple-300 text-xs">{isRealSocialData ? 'Live posts' : 'Demo data'}</p>
              </div>
              <div className="bg-gray-700 p-2 rounded border border-gray-500/30">
                <p className="text-gray-400 font-medium">🔍 Search</p>
                <p className="text-white">{search.results.length} results</p>
                <p className="text-gray-300 text-xs">{search.query || 'No query'}</p>
              </div>
            </div>
            <div className="bg-gray-800 p-3 rounded border border-gray-600">
              <p className="text-gray-400 font-medium text-sm mb-2">🔥 Data Status Summary:</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>🎵 Spotify API:</span>
                  <span className={isRealMusicData ? 'text-green-400' : 'text-yellow-400'}>
                    {isRealMusicData ? '✅ Connected' : '⚠️ Demo Mode'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>📰 News API:</span>
                  <span className={isRealNewsData ? 'text-green-400' : 'text-yellow-400'}>
                    {isRealNewsData ? '✅ Live' : '⚠️ Demo Mode'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>💬 Social API:</span>
                  <span className={isRealSocialData ? 'text-green-400' : 'text-yellow-400'}>
                    {isRealSocialData ? '✅ Live' : '⚠️ Demo Mode'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <motion.div 
      className="fixed bottom-4 right-4 z-50"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`bg-gray-900 bg-opacity-95 backdrop-blur-sm text-white rounded-lg shadow-2xl border border-gray-700 overflow-hidden ${
        isExpanded ? 'w-80' : 'w-48'
      } transition-all duration-300`}>
        
        {/* Header */}
        <div 
          className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 cursor-pointer flex items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold">Debug Panel</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-700">
                {dataTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setActiveTab(type.id as 'music' | 'news' | 'social' | 'all')}
                    className={`flex-1 px-2 py-2 text-xs font-medium transition-colors relative ${
                      activeTab === type.id
                        ? `text-${type.color}-400 bg-${type.color}-900/20 border-b-2 border-${type.color}-400`
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>{type.label}</span>
                      {type.status === 'real' && (
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      )}
                      {type.status === 'demo' && (
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                      )}
                    </div>
                    <div className="text-xs">{type.count}</div>
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-3 max-h-60 overflow-y-auto">
                {renderContent()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed view */}
        {!isExpanded && (
          <div className="p-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Total Items:</span>
              <span className="text-white font-bold">
                {music.tracks.length + news.articles.length + social.posts.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
