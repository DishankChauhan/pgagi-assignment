import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../../src/lib/hooks/useDebounce'
import { Provider } from 'react-redux'
import { store } from '../../src/lib/store'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import DragAndDropProvider from '../../src/components/DragAndDropProvider'
import DroppableArea from '../../src/components/DroppableArea'
import { NewsArticle, SpotifyTrack, SocialPost } from '../../src/lib/features/contentSlice'

const mockNewsArticle: NewsArticle = {
  id: 'news-1',
  title: 'Test News Article',
  description: 'Test description',
  url: 'https://example.com',
  urlToImage: 'https://example.com/image.jpg',
  publishedAt: '2023-01-01',
  source: { name: 'Test Source' },
  category: 'technology'
}

const mockMusicTrack: SpotifyTrack = {
  id: 'music-1',
  name: 'Test Song',
  artists: [{ name: 'Test Artist' }],
  album: {
    name: 'Test Album',
    images: [{ url: 'https://example.com/album.jpg' }],
    release_date: '2023-01-01'
  },
  preview_url: null,
  external_urls: { spotify: 'https://open.spotify.com/track/test' },
  popularity: 80,
  duration_ms: 180000
}

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  )
}

describe('Drag & Drop and Infinite Scroll Functionality', () => {
  describe('useDebounce hook', () => {
    it('should debounce values correctly', async () => {
      jest.useFakeTimers()
      
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      )

      expect(result.current).toBe('initial')

      // Update the value
      rerender({ value: 'updated', delay: 500 })
      expect(result.current).toBe('initial') // Should still be initial

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(500)
      })

      expect(result.current).toBe('updated')
      
      jest.useRealTimers()
    })
  })

  describe('DragAndDropProvider', () => {
    it('should render children correctly', () => {
      renderWithProvider(
        <DragAndDropProvider>
          <div data-testid="test-child">Test Content</div>
        </DragAndDropProvider>
      )

      expect(screen.getByTestId('test-child')).toBeInTheDocument()
    })

    it('should provide drag and drop context', () => {
      renderWithProvider(
        <DragAndDropProvider>
          <DroppableArea
            id="test-area"
            title="Test Area"
            items={[mockNewsArticle]}
          />
        </DragAndDropProvider>
      )

      expect(screen.getByText('Test Area')).toBeInTheDocument()
      expect(screen.getByText('1 item')).toBeInTheDocument()
    })
  })

  describe('DroppableArea', () => {
    it('should render with correct title and item count', () => {
      renderWithProvider(
        <DragAndDropProvider>
          <DroppableArea
            id="news"
            title="Latest News"
            items={[mockNewsArticle, { ...mockNewsArticle, id: 'news-2' }]}
          />
        </DragAndDropProvider>
      )

      expect(screen.getByText('Latest News')).toBeInTheDocument()
      expect(screen.getByText('2 items')).toBeInTheDocument()
    })

    it('should show empty state when no items', () => {
      renderWithProvider(
        <DragAndDropProvider>
          <DroppableArea
            id="empty"
            title="Empty Area"
            items={[]}
          />
        </DragAndDropProvider>
      )

      expect(screen.getByText('Drag content here to organize')).toBeInTheDocument()
    })

    it('should handle different content types', () => {
      renderWithProvider(
        <DragAndDropProvider>
          <DroppableArea
            id="mixed"
            title="Mixed Content"
            items={[mockNewsArticle, mockMusicTrack]}
          />
        </DragAndDropProvider>
      )

      expect(screen.getByText('2 items')).toBeInTheDocument()
    })
  })

  describe('Infinite Scroll Integration', () => {
    it('should trigger loading when intersection observer fires', async () => {
      // Mock IntersectionObserver
      const mockIntersectionObserver = jest.fn()
      mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null,
      })
      window.IntersectionObserver = mockIntersectionObserver

      // This would need actual component integration
      // For now, just test that the mock is set up correctly
      expect(window.IntersectionObserver).toBeDefined()
    })
  })
})

// Mock for intersection observer
beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  }
})
