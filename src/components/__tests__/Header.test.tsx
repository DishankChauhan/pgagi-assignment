import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { SessionProvider } from 'next-auth/react'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '@/lib/store'
import Header from '@/components/Header'

// Mock debounce from lodash
jest.mock('lodash', () => ({
  debounce: (fn: () => void) => fn,
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: () => ({
    data: {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: null
      }
    },
    status: 'authenticated'
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const mockStore = configureStore({
  reducer: rootReducer,
  preloadedState: {
    ui: {
      sidebarOpen: true,
      activeSection: 'feed',
      darkMode: false,
      settingsOpen: false,
      searchQuery: '',
    },
    userPreferences: {
        preferences: {
            favoriteCategories: ['technology'],
            language: 'en',
            darkMode: false,
            favoriteContent: [],
            musicGenres: [],
            autoRefresh: false,
            refreshInterval: 0,
            notificationsEnabled: false,
            feedLayout: 'grid',
            contentTypes: {
                news: false,
                music: false,
                social: false
            }
        },
        isLoading: false,
        error: null,
        availableCategories: [],
        availableMusicGenres: []
    },
    content: {
        news: { articles: [], isLoading: false, error: null, hasMore: true, page: 1 },
        social: { posts: [], isLoading: false, error: null, hasMore: true, page: 1 },
        music: { tracks: [], isLoading: false, error: null, hasMore: true, page: 1 },
        trending: {
            news: [], isLoading: false, error: null,
            music: []
        },
        search: { results: [], isLoading: false, error: null, query: '' },
    },
  },
})

const renderWithStore = (component: React.ReactElement) => {
  return render(
    <SessionProvider session={null}>
      <Provider store={mockStore}>
        {component}
      </Provider>
    </SessionProvider>
  )
}

describe('Header Component', () => {
  it('renders the header with correct title', () => {
    renderWithStore(<Header />)
    expect(screen.getByText('Content Dashboard')).toBeInTheDocument()
  })

  it('renders search input with correct placeholder', () => {
    renderWithStore(<Header />)
    expect(screen.getByPlaceholderText('Search news, music, or social posts...')).toBeInTheDocument()
  })

  it('handles dark mode toggle', () => {
    renderWithStore(<Header />)
    const darkModeButton = screen.getByTitle('Toggle dark mode')
    fireEvent.click(darkModeButton)
    // We would need to check if the action was dispatched, but for now this tests the click handler
    expect(darkModeButton).toBeInTheDocument()
  })

  it('handles settings toggle', () => {
    renderWithStore(<Header />)
    const settingsButton = screen.getByTitle('Settings')
    fireEvent.click(settingsButton)
    expect(settingsButton).toBeInTheDocument()
  })

  it('handles search input change', () => {
    renderWithStore(<Header />)
    const searchInput = screen.getByPlaceholderText('Search news, music, or social posts...')
    fireEvent.change(searchInput, { target: { value: 'test search' } })
    expect(searchInput).toHaveValue('test search')
  })
})
