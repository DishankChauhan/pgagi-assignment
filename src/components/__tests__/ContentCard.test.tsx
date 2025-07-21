import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '@/lib/store'
import ContentCard from '@/components/ContentCard'

const mockStore = configureStore({
  reducer: rootReducer,
  preloadedState: {
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
    ui: {
      sidebarOpen: true,
      activeSection: 'feed',
      darkMode: false,
      settingsOpen: false,
      searchQuery: '',
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
    <Provider store={mockStore}>
      {component}
    </Provider>
  )
}

const mockNewsCard = {
  id: 'news-1',
  title: 'Test News Article',
  description: 'This is a test news article description',
  imageUrl: 'https://example.com/image.jpg',
  source: 'Test Source',
  publishedAt: '2023-12-01T10:00:00Z',
  type: 'news' as const,
  url: 'https://example.com/article',
}

const mockMusicCard = {
  id: 'music-1',
  title: 'Test Song',
  description: 'Artist Name • Album Name',
  imageUrl: 'https://example.com/album.jpg',
  publishedAt: '2023-12-01',
  type: 'music' as const,
  url: 'https://open.spotify.com/track/test',
  additionalInfo: {
    album: 'Test Album',
    duration: 180000,
    popularity: 85,
  },
}

describe('ContentCard Component', () => {
  it('renders news card with correct information', () => {
    renderWithStore(<ContentCard {...mockNewsCard} />)
    
    expect(screen.getByText('Test News Article')).toBeInTheDocument()
    expect(screen.getByText('This is a test news article description')).toBeInTheDocument()
    expect(screen.getByText('Test Source')).toBeInTheDocument()
    expect(screen.getByText('Read More')).toBeInTheDocument()
  })

  it('renders music card with correct information', () => {
    renderWithStore(<ContentCard {...mockMusicCard} />)
    
    expect(screen.getByText('Test Song')).toBeInTheDocument()
    expect(screen.getByText('Artist Name • Album Name')).toBeInTheDocument()
    expect(screen.getByText('Listen on Spotify')).toBeInTheDocument()
  })

  it('handles favorite toggle', () => {
    renderWithStore(<ContentCard {...mockNewsCard} />)
    
    const favoriteButton = screen.getByRole('button', { name: /add to favorites/i })
    fireEvent.click(favoriteButton)
    
    // The button should still exist after clicking
    expect(favoriteButton).toBeInTheDocument()
  })

  it('handles card click', () => {
    // Mock window.open
    const mockWindowOpen = jest.fn()
    Object.defineProperty(window, 'open', {
      value: mockWindowOpen,
      writable: true,
    })

    renderWithStore(<ContentCard {...mockNewsCard} />)
    
    const card = screen.getByText('Test News Article').closest('div')
    if (card) {
      fireEvent.click(card)
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://example.com/article',
        '_blank',
        'noopener,noreferrer'
      )
    }
  })

  it('shows correct type badge', () => {
    renderWithStore(<ContentCard {...mockNewsCard} />)
    expect(screen.getByText('News')).toBeInTheDocument()
  })

  it('handles image error gracefully', () => {
    renderWithStore(<ContentCard {...mockNewsCard} />)
    const image = screen.getByAltText('Test News Article')
    
    // Simulate image load error
    fireEvent.error(image)
    
    // The image should be removed from the DOM after error
    expect(screen.queryByAltText('Test News Article')).not.toBeInTheDocument()
  })
})
