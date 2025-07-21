import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    name: string
  }
  category: string
}

export interface SocialPost {
  id: string
  text: string
  user: {
    name: string
    username: string
    profile_image_url: string
  }
  created_at: string
  public_metrics?: {
    like_count: number
    retweet_count: number
  }
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
    release_date: string
  }
  preview_url: string | null
  external_urls: {
    spotify: string
  }
  popularity: number
  duration_ms: number
}

export interface ContentState {
  news: {
    articles: NewsArticle[]
    isLoading: boolean
    error: string | null
    hasMore: boolean
    page: number
  }
  social: {
    posts: SocialPost[]
    isLoading: boolean
    error: string | null
    hasMore: boolean
    page: number
  }
  music: {
    tracks: SpotifyTrack[]
    isLoading: boolean
    error: string | null
    hasMore: boolean
    page: number
  }
  trending: {
    news: NewsArticle[]
    music: SpotifyTrack[]
    isLoading: boolean
    error: string | null
  }
  search: {
    results: (NewsArticle | SocialPost | SpotifyTrack)[]
    isLoading: boolean
    error: string | null
    query: string
  }
}

const initialState: ContentState = {
  news: {
    articles: [],
    isLoading: false,
    error: null,
    hasMore: true,
    page: 1,
  },
  social: {
    posts: [],
    isLoading: false,
    error: null,
    hasMore: true,
    page: 1,
  },
  music: {
    tracks: [],
    isLoading: false,
    error: null,
    hasMore: true,
    page: 1,
  },
  trending: {
    news: [],
    music: [],
    isLoading: false,
    error: null,
  },
  search: {
    results: [],
    isLoading: false,
    error: null,
    query: '',
  },
}

// Async thunks for fetching content
export const fetchNews = createAsyncThunk(
  'content/fetchNews',
  async ({ categories, page = 1 }: { categories: string[], page?: number }) => {
    const category = categories.join(',') || 'general'
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=${category}&page=${page}&pageSize=20&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`
    )
    const data = await response.json()
    return { articles: data.articles || [], page }
  }
)

export const fetchSocialPosts = createAsyncThunk(
  'content/fetchSocialPosts',
  async ({ hashtag = 'technology' }: { hashtag?: string }) => {
    // Mock social media data since Twitter API requires authentication
    const mockPosts: SocialPost[] = Array.from({ length: 10 }, (_, i) => ({
      id: `post-${i}`,
      text: `This is a mock social media post about ${hashtag} #${hashtag} #trending`,
      user: {
        name: `User ${i + 1}`,
        username: `user${i + 1}`,
        profile_image_url: `https://i.pravatar.cc/150?img=${i + 1}`,
      },
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      public_metrics: {
        like_count: Math.floor(Math.random() * 1000),
        retweet_count: Math.floor(Math.random() * 100),
      },
    }))
    return mockPosts
  }
)

export const fetchTrendingContent = createAsyncThunk(
  'content/fetchTrendingContent',
  async () => {
    const [newsResponse, musicResponse] = await Promise.all([
      fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`),
      fetch('/api/spotify?type=trending&limit=5')
    ])
    
    const newsData = await newsResponse.json()
    const musicData = await musicResponse.json()
    
    return {
      news: newsData.articles || [],
      music: musicData.tracks || [],
    }
  }
)

export const searchContent = createAsyncThunk(
  'content/searchContent',
  async ({ query }: { query: string }) => {
    const [newsResponse, musicResponse] = await Promise.all([
      fetch(`https://newsapi.org/v2/everything?q=${query}&pageSize=10&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`),
      fetch(`/api/spotify?type=search&query=${encodeURIComponent(query)}&limit=10`)
    ])
    
    const newsData = await newsResponse.json()
    const musicData = await musicResponse.json()
    
    return [
      ...(newsData.articles || []),
      ...(musicData.tracks || []),
    ]
  }
)

export const fetchMusic = createAsyncThunk(
  'content/fetchMusic',
  async ({ type = 'top', query = '', page = 1 }: { type?: string, query?: string, page?: number }) => {
    try {
      const response = await fetch(
        `/api/spotify?type=${type}&query=${encodeURIComponent(query)}&limit=20`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch music')
      }
      const data = await response.json()
      return { tracks: data.tracks || [], page }
    } catch (error) {
      console.error('Error fetching music:', error)
      return { tracks: [], page }
    }
  }
)

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.search.results = []
      state.search.query = ''
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.search.query = action.payload
    },
    reorderContent: (state, action: PayloadAction<{ 
      section: 'news' | 'social' | 'music' | 'trending' | 'search'
      activeId: string
      overId: string 
    }>) => {
      const { section, activeId, overId } = action.payload
      
      if (section === 'news') {
        const oldIndex = state.news.articles.findIndex(item => item.id === activeId)
        const newIndex = state.news.articles.findIndex(item => item.id === overId)
        if (oldIndex !== -1 && newIndex !== -1) {
          const [reorderedItem] = state.news.articles.splice(oldIndex, 1)
          state.news.articles.splice(newIndex, 0, reorderedItem)
        }
      } else if (section === 'social') {
        const oldIndex = state.social.posts.findIndex(item => item.id === activeId)
        const newIndex = state.social.posts.findIndex(item => item.id === overId)
        if (oldIndex !== -1 && newIndex !== -1) {
          const [reorderedItem] = state.social.posts.splice(oldIndex, 1)
          state.social.posts.splice(newIndex, 0, reorderedItem)
        }
      } else if (section === 'music') {
        const oldIndex = state.music.tracks.findIndex(item => item.id === activeId)
        const newIndex = state.music.tracks.findIndex(item => item.id === overId)
        if (oldIndex !== -1 && newIndex !== -1) {
          const [reorderedItem] = state.music.tracks.splice(oldIndex, 1)
          state.music.tracks.splice(newIndex, 0, reorderedItem)
        }
      }
    },
    moveContentBetweenSections: (state, action: PayloadAction<{
      itemId: string
      fromSection: string
      toSection: string
    }>) => {
      const { itemId, fromSection, toSection } = action.payload
      
      // Find and remove item from source section
      let movedItem: NewsArticle | SocialPost | SpotifyTrack | null = null
      
      if (fromSection === 'news') {
        const index = state.news.articles.findIndex(item => item.id === itemId)
        if (index !== -1) {
          movedItem = state.news.articles.splice(index, 1)[0]
        }
      } else if (fromSection === 'social') {
        const index = state.social.posts.findIndex(item => item.id === itemId)
        if (index !== -1) {
          movedItem = state.social.posts.splice(index, 1)[0]
        }
      } else if (fromSection === 'music') {
        const index = state.music.tracks.findIndex(item => item.id === itemId)
        if (index !== -1) {
          movedItem = state.music.tracks.splice(index, 1)[0]
        }
      }
      
      // Add item to destination section (if found and sections are different)
      if (movedItem && fromSection !== toSection) {
        if (toSection === 'news' && 'source' in movedItem) {
          state.news.articles.push(movedItem)
        } else if (toSection === 'social' && 'user' in movedItem) {
          state.social.posts.push(movedItem)
        } else if (toSection === 'music' && 'artists' in movedItem) {
          state.music.tracks.push(movedItem)
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // News
      .addCase(fetchNews.pending, (state) => {
        state.news.isLoading = true
        state.news.error = null
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.news.isLoading = false
        const { articles, page } = action.payload
        if (page === 1) {
          state.news.articles = articles
        } else {
          state.news.articles.push(...articles)
        }
        state.news.page = page
        state.news.hasMore = articles.length === 20
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.news.isLoading = false
        state.news.error = action.error.message || 'Failed to fetch news'
      })
      // Social
      .addCase(fetchSocialPosts.pending, (state) => {
        state.social.isLoading = true
        state.social.error = null
      })
      .addCase(fetchSocialPosts.fulfilled, (state, action) => {
        state.social.isLoading = false
        state.social.posts = action.payload
      })
      .addCase(fetchSocialPosts.rejected, (state, action) => {
        state.social.isLoading = false
        state.social.error = action.error.message || 'Failed to fetch social posts'
      })
      // Trending
      .addCase(fetchTrendingContent.pending, (state) => {
        state.trending.isLoading = true
        state.trending.error = null
      })
      .addCase(fetchTrendingContent.fulfilled, (state, action) => {
        state.trending.isLoading = false
        state.trending.news = action.payload.news
        state.trending.music = action.payload.music
      })
      .addCase(fetchTrendingContent.rejected, (state, action) => {
        state.trending.isLoading = false
        state.trending.error = action.error.message || 'Failed to fetch trending content'
      })
      // Search
      .addCase(searchContent.pending, (state) => {
        state.search.isLoading = true
        state.search.error = null
      })
      .addCase(searchContent.fulfilled, (state, action) => {
        state.search.isLoading = false
        state.search.results = action.payload
      })
      .addCase(searchContent.rejected, (state, action) => {
        state.search.isLoading = false
        state.search.error = action.error.message || 'Failed to search content'
      })
      // Music
      .addCase(fetchMusic.pending, (state) => {
        state.music.isLoading = true
        state.music.error = null
      })
      .addCase(fetchMusic.fulfilled, (state, action) => {
        state.music.isLoading = false
        const { tracks, page } = action.payload
        if (page === 1) {
          state.music.tracks = tracks
        } else {
          state.music.tracks.push(...tracks)
        }
        state.music.page = page
        state.music.hasMore = tracks.length === 20
      })
      .addCase(fetchMusic.rejected, (state, action) => {
        state.music.isLoading = false
        state.music.error = action.error.message || 'Failed to fetch music'
      })
  },
})

export const { clearSearch, setSearchQuery, reorderContent, moveContentBetweenSections } = contentSlice.actions
export default contentSlice.reducer
