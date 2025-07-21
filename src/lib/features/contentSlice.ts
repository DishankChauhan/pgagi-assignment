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
    // Add timestamp to prevent caching and get fresh results
    const timestamp = new Date().toISOString().split('T')[0] // Use current date
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=${category}&page=${page}&pageSize=20&sortBy=publishedAt&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}&from=${timestamp}`
    )
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'error') {
      throw new Error(data.message || 'NewsAPI returned an error')
    }
    
    // Filter out articles with null/empty titles or descriptions
    const validArticles = (data.articles || []).filter((article: NewsArticle) => 
      article.title && 
      article.title !== '[Removed]' && 
      article.description && 
      article.description !== '[Removed]'
    )
    
    console.log(`✅ Fetched ${validArticles.length} real news articles for page ${page}`)
    return { articles: validArticles, page }
  }
)

export const fetchSocialPosts = createAsyncThunk(
  'content/fetchSocialPosts',
  async ({ hashtag = 'technology' }: { hashtag?: string }) => {
    // Mock social media data since Twitter API requires authentication
    const timestamp = Date.now()
    const topics = ['AI revolution', 'startup news', 'tech trends', 'innovation update', 'digital transformation', 'coding life', 'product launch', 'tech review']
    
    const mockPosts: SocialPost[] = Array.from({ length: 10 }, (_, i) => ({
      id: `post-${i}-${timestamp}`,
      text: `${topics[i % topics.length]} - This is about ${hashtag} and the latest developments in tech! #${hashtag} #trending #tech`,
      user: {
        name: `TechUser ${i + 1}`,
        username: `techuser${i + 1}`,
        profile_image_url: `https://i.pravatar.cc/150?img=${(i % 50) + 1}`,
      },
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      public_metrics: {
        like_count: Math.floor(Math.random() * 1000) + i * 10,
        retweet_count: Math.floor(Math.random() * 100) + i * 2,
      },
    }))
    return mockPosts
  }
)

export const fetchTrendingContent = createAsyncThunk(
  'content/fetchTrendingContent',
  async () => {
    // Add random query terms to get varied trending content
    const trendingQueries = ['breaking', 'latest', 'trending', 'news', 'today']
    const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)]
    
    const [newsResponse, musicResponse] = await Promise.all([
      fetch(`https://newsapi.org/v2/everything?q=${randomQuery}&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`),
      fetch('/api/spotify?type=trending&limit=5')
    ])
    
    const newsData = await newsResponse.json()
    const musicData = await musicResponse.json()
    
    // Filter valid news articles
    const validNewsArticles = (newsData.articles || []).filter((article: NewsArticle) => 
      article.title && 
      article.title !== '[Removed]' && 
      article.description && 
      article.description !== '[Removed]'
    )
    
    console.log(`✅ Fetched ${validNewsArticles.length} trending news articles`)
    console.log(`✅ Fetched ${musicData.tracks?.length || 0} trending music tracks`)
    
    return {
      news: validNewsArticles,
      music: musicData.tracks || [],
    }
  }
)

export const searchContent = createAsyncThunk(
  'content/searchContent',
  async ({ query }: { query: string }) => {
    console.log(`🔍 Searching for: "${query}"`)
    
    try {
      const [newsResponse, musicResponse] = await Promise.all([
        fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=10&sortBy=relevancy&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`),
        fetch(`/api/spotify?type=search&query=${encodeURIComponent(query)}&limit=10`)
      ])
      
      const newsData = await newsResponse.json()
      const musicData = await musicResponse.json()
      
      // Filter valid news articles
      const validNewsArticles = (newsData.articles || []).filter((article: NewsArticle) => 
        article.title && 
        article.title !== '[Removed]' && 
        article.description && 
        article.description !== '[Removed]'
      )
      
      const results = [
        ...validNewsArticles,
        ...(musicData.tracks || []),
      ]
      
      console.log(`✅ Search results: ${validNewsArticles.length} news + ${musicData.tracks?.length || 0} music = ${results.length} total`)
      
      return results
    } catch (error) {
      console.error('Error searching content:', error)
      throw error
    }
  }
)

export const fetchMusic = createAsyncThunk(
  'content/fetchMusic',
  async ({ type = 'top', query = '', page = 1 }: { type?: string, query?: string, page?: number }) => {
    try {
      const response = await fetch(
        `/api/spotify?type=${type}&query=${encodeURIComponent(query)}&limit=20&page=${page}`
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
      
      // Helper function to reorder array
      const reorderArray = <T extends { id: string }>(array: T[], activeId: string, overId: string): T[] => {
        const oldIndex = array.findIndex(item => item.id === activeId)
        const newIndex = array.findIndex(item => item.id === overId)
        
        if (oldIndex === -1 || newIndex === -1) return array
        
        const result = [...array]
        const [reorderedItem] = result.splice(oldIndex, 1)
        result.splice(newIndex, 0, reorderedItem)
        return result
      }
      
      if (section === 'news') {
        state.news.articles = reorderArray(state.news.articles, activeId, overId)
      } else if (section === 'social') {
        state.social.posts = reorderArray(state.social.posts, activeId, overId)
      } else if (section === 'music') {
        state.music.tracks = reorderArray(state.music.tracks, activeId, overId)
      } else if (section === 'search') {
        state.search.results = reorderArray(state.search.results, activeId, overId)
      } else if (section === 'trending') {
        // Handle trending content reordering
        const allTrending = [...state.trending.news, ...state.trending.music]
        const reordered = reorderArray(allTrending, activeId, overId)
        // Split back into news and music
        state.trending.news = reordered.filter(item => 'source' in item) as NewsArticle[]
        state.trending.music = reordered.filter(item => 'artists' in item) as SpotifyTrack[]
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
      .addCase(searchContent.pending, (state, action) => {
        state.search.isLoading = true
        state.search.error = null
        state.search.query = action.meta.arg.query
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
