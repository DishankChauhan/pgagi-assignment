'use client'

import { useEffect, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchNews, fetchMusic } from '@/lib/features/contentSlice'

interface UseInfiniteScrollProps {
  contentType: 'news' | 'music'
  page: number
  onPageChange: (page: number) => void
}

export function useInfiniteScroll({ contentType, page, onPageChange }: UseInfiniteScrollProps) {
  const dispatch = useAppDispatch()
  const { favoriteCategories } = useAppSelector((state) => state.userPreferences.preferences)
  const { news, music } = useAppSelector((state) => state.content)

  const contentState = contentType === 'news' ? news : music

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  const loadMore = useCallback(() => {
    if (inView && !contentState.isLoading && contentState.hasMore) {
      const nextPage = page + 1
      
      if (contentType === 'news') {
        dispatch(fetchNews({ categories: favoriteCategories, page: nextPage }))
      } else if (contentType === 'music') {
        dispatch(fetchMusic({ type: 'top', page: nextPage }))
      }
      
      onPageChange(nextPage)
    }
  }, [inView, contentState.isLoading, contentState.hasMore, page, contentType, dispatch, favoriteCategories, onPageChange])

  useEffect(() => {
    loadMore()
  }, [loadMore])

  return {
    ref,
    isLoading: contentState.isLoading,
    hasMore: contentState.hasMore,
    items: contentType === 'news' ? news.articles : music.tracks
  }
}
