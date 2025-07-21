import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface UserPreferences {
  favoriteCategories: string[]
  language: string
  darkMode: boolean
  favoriteContent: string[]
  musicGenres: string[]
  autoRefresh: boolean
  refreshInterval: number // in minutes
  notificationsEnabled: boolean
  feedLayout: 'grid' | 'list'
  contentTypes: {
    news: boolean
    music: boolean
    social: boolean
  }
}

interface UserPreferencesState {
  preferences: UserPreferences
  isLoading: boolean
  error: string | null
  availableCategories: string[]
  availableMusicGenres: string[]
}

const initialState: UserPreferencesState = {
  preferences: {
    favoriteCategories: ['technology', 'general'],
    language: 'en',
    darkMode: false,
    favoriteContent: [],
    musicGenres: ['pop', 'rock'],
    autoRefresh: true,
    refreshInterval: 5,
    notificationsEnabled: true,
    feedLayout: 'grid',
    contentTypes: {
      news: true,
      music: true,
      social: true,
    },
  },
  isLoading: false,
  error: null,
  availableCategories: [
    'business',
    'entertainment',
    'general',
    'health',
    'science',
    'sports',
    'technology',
  ],
  availableMusicGenres: [
    'pop',
    'rock',
    'hip-hop',
    'electronic',
    'classical',
    'jazz',
    'country',
    'r&b',
    'indie',
    'alternative',
  ],
}

// Async thunk for saving preferences to localStorage
export const savePreferences = createAsyncThunk(
  'userPreferences/savePreferences',
  async (preferences: UserPreferences) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100))
    localStorage.setItem('userPreferences', JSON.stringify(preferences))
    return preferences
  }
)

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    updateCategories: (state, action: PayloadAction<string[]>) => {
      state.preferences.favoriteCategories = action.payload
    },
    updateMusicGenres: (state, action: PayloadAction<string[]>) => {
      state.preferences.musicGenres = action.payload
    },
    toggleDarkMode: (state) => {
      state.preferences.darkMode = !state.preferences.darkMode
    },
    toggleAutoRefresh: (state) => {
      state.preferences.autoRefresh = !state.preferences.autoRefresh
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.preferences.refreshInterval = action.payload
    },
    toggleNotifications: (state) => {
      state.preferences.notificationsEnabled = !state.preferences.notificationsEnabled
    },
    setFeedLayout: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.preferences.feedLayout = action.payload
    },
    toggleContentType: (state, action: PayloadAction<keyof UserPreferences['contentTypes']>) => {
      state.preferences.contentTypes[action.payload] = !state.preferences.contentTypes[action.payload]
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.preferences.language = action.payload
    },
    addToFavorites: (state, action: PayloadAction<string>) => {
      if (!state.preferences.favoriteContent.includes(action.payload)) {
        state.preferences.favoriteContent.push(action.payload)
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.preferences.favoriteContent = state.preferences.favoriteContent.filter(
        id => id !== action.payload
      )
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(savePreferences.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(savePreferences.fulfilled, (state, action) => {
        state.isLoading = false
        state.preferences = action.payload
      })
      .addCase(savePreferences.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to save preferences'
      })
  },
})

export const { 
  updateCategories,
  updateMusicGenres,
  toggleDarkMode,
  toggleAutoRefresh,
  setRefreshInterval,
  toggleNotifications,
  setFeedLayout,
  toggleContentType,
  setLanguage,
  addToFavorites, 
  removeFromFavorites 
} = userPreferencesSlice.actions

export default userPreferencesSlice.reducer
