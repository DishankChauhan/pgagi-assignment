'use client'

import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchNews, fetchSocialPosts, fetchMusic, fetchTrendingContent } from '@/lib/features/contentSlice'

export function useAutoRefresh() {
  const dispatch = useAppDispatch()
  const { autoRefresh, refreshInterval, favoriteCategories } = useAppSelector(
    (state) => state.userPreferences.preferences
  )

  const refreshContent = useCallback(() => {
    // Refresh main content
    dispatch(fetchNews({ categories: favoriteCategories, page: 1 }))
    dispatch(fetchMusic({ type: 'top', page: 1 }))
    dispatch(fetchSocialPosts({ hashtag: 'technology' }))
    
    // Refresh trending content
    dispatch(fetchTrendingContent())
  }, [dispatch, favoriteCategories])

  useEffect(() => {
    if (!autoRefresh) return

    const intervalMs = refreshInterval * 60 * 1000 // Convert minutes to milliseconds
    const interval = setInterval(refreshContent, intervalMs)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshContent])

  return { refreshContent }
}

export function useRealTimeUpdates() {
  const dispatch = useAppDispatch()
  const { autoRefresh, favoriteCategories } = useAppSelector(
    (state) => state.userPreferences.preferences
  )

  const checkForUpdates = useCallback(async () => {
    if (!autoRefresh) return

    try {
      // Simulate checking for new content by fetching latest page
      dispatch(fetchNews({ categories: favoriteCategories, page: 1 }))
    } catch (error) {
      console.error('Error checking for updates:', error)
    }
  }, [dispatch, favoriteCategories, autoRefresh])

  useEffect(() => {
    if (!autoRefresh) return

    // Check for updates every 30 seconds
    const interval = setInterval(checkForUpdates, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh, checkForUpdates])

  return { checkForUpdates }
}
