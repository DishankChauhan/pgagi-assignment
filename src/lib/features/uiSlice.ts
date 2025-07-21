import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  activeSection: 'feed' | 'trending' | 'favorites' | 'search'
  darkMode: boolean
  settingsOpen: boolean
  searchQuery: string
}

const initialState: UIState = {
  sidebarOpen: true,
  activeSection: 'feed',
  darkMode: false,
  settingsOpen: false,
  searchQuery: '',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setActiveSection: (state, action: PayloadAction<'feed' | 'trending' | 'favorites' | 'search'>) => {
      state.activeSection = action.payload
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
    },
    toggleSettings: (state) => {
      state.settingsOpen = !state.settingsOpen
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
  },
})

export const {
  toggleSidebar,
  setActiveSection,
  toggleDarkMode,
  toggleSettings,
  setSearchQuery,
} = uiSlice.actions

export default uiSlice.reducer
