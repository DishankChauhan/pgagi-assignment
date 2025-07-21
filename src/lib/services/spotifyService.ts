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

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: { url: string }[]
  tracks: {
    total: number
  }
  external_urls: {
    spotify: string
  }
  owner: {
    display_name: string
  }
}

class SpotifyService {
  private static instance: SpotifyService
  private clientCredentialsToken: string | null = null

  private constructor() {}

  static getInstance(): SpotifyService {
    if (!SpotifyService.instance) {
      SpotifyService.instance = new SpotifyService()
    }
    return SpotifyService.instance
  }

  private async getClientCredentialsToken(): Promise<string> {
    if (this.clientCredentialsToken) {
      return this.clientCredentialsToken
    }

    // Check if credentials are available
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      console.warn('❌ Spotify credentials not configured in environment variables')
      throw new Error('Spotify credentials not configured')
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
        },
        body: 'grant_type=client_credentials'
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.warn('❌ Spotify API authentication failed:', response.status, errorText)
        console.warn('📝 Please check your Spotify credentials at https://developer.spotify.com/dashboard')
        console.warn('🔧 Current Client ID:', process.env.SPOTIFY_CLIENT_ID?.substring(0, 8) + '...')
        throw new Error(`Invalid Spotify credentials - please update your .env.local file with valid credentials from https://developer.spotify.com/dashboard`)
      }

      const data = await response.json()
      this.clientCredentialsToken = data.access_token
      console.log('✅ Spotify API authentication successful - Using REAL Spotify data!')
      return this.clientCredentialsToken!
    } catch (error) {
      console.warn('❌ Error getting Spotify token. Please get valid credentials from https://developer.spotify.com/dashboard')
      throw error
    }
  }

  private async makeSpotifyRequest(endpoint: string) {
    try {
      const token = await this.getClientCredentialsToken()
      const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Spotify API request failed:', error)
      return null
    }
  }

  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const data = await this.makeSpotifyRequest(`search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=US`)
      
      if (!data?.tracks?.items) {
        console.warn('No tracks found in search, using mock data')
        return this.getMockTracks(limit, `search-${query}`)
      }

      console.log(`✅ Found ${data.tracks.items.length} REAL tracks for search: "${query}"`)
      return data.tracks.items.map((track: Record<string, unknown>) => ({
        id: track.id,
        name: track.name,
        artists: track.artists,
        album: track.album,
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        popularity: track.popularity,
        duration_ms: track.duration_ms,
      }))
    } catch (error) {
      console.error('Error searching tracks:', error)
      return this.getMockTracks(limit, `search-${query}`)
    }
  }

  async getTopTracks(limit: number = 20, page: number = 1): Promise<SpotifyTrack[]> {
    try {
      // Use a more popular search query for better results
      const popularQueries = ['pop', 'top hits', 'chart', 'trending', 'popular music']
      const query = popularQueries[(page - 1) % popularQueries.length]
      
      const data = await this.makeSpotifyRequest(`search?q=${query}&type=track&limit=${limit}&market=US&offset=${(page - 1) * limit}`)
      
      if (!data?.tracks?.items) {
        console.warn('No top tracks found, using mock data')
        return this.getMockTracks(limit, `top-page${page}`)
      }

      console.log(`✅ Fetched ${data.tracks.items.length} REAL top tracks for page ${page}`)
      return data.tracks.items.map((track: Record<string, unknown>) => ({
        id: `${track.id}-page${page}`, // Add page suffix to ensure unique IDs
        name: track.name,
        artists: track.artists,
        album: track.album,
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        popularity: track.popularity,
        duration_ms: track.duration_ms,
      }))
    } catch (error) {
      console.error('Error getting top tracks:', error)
      return this.getMockTracks(limit, `top-page${page}`)
    }
  }

  async getRecommendations(seedGenres: string[] = ['pop', 'rock'], limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const data = await this.makeSpotifyRequest(`recommendations?seed_genres=${seedGenres.join(',')}&limit=${limit}`)
      
      if (!data?.tracks) {
        return this.getMockTracks(limit)
      }

      return data.tracks.map((track: Record<string, unknown>) => ({
        id: track.id,
        name: track.name,
        artists: track.artists,
        album: track.album,
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        popularity: track.popularity,
        duration_ms: track.duration_ms,
      }))
    } catch (error) {
      console.error('Error getting recommendations:', error)
      return this.getMockTracks(limit)
    }
  }

  async getTrendingTracks(limit: number = 20, page: number = 1): Promise<SpotifyTrack[]> {
    try {
      // For trending, we could fetch from a different endpoint or use different data
      // For now, we'll use the same logic as getTopTracks but with different mock IDs
      const data = await this.makeSpotifyRequest(`browse/featured-playlists?limit=1`)
      
      if (!data?.playlists?.items?.[0]) {
        return this.getMockTracks(limit, `trending-page${page}`)
      }

      const playlistId = data.playlists.items[0].id
      const offset = (page - 1) * limit
      const tracksData = await this.makeSpotifyRequest(`playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`)
      
      if (!tracksData?.items) {
        return this.getMockTracks(limit, `trending-page${page}`)
      }

      return tracksData.items
        .filter((item: Record<string, unknown>) => item.track)
        .map((item: Record<string, unknown>) => {
          const track = item.track as Record<string, unknown>
          return {
            id: `trending-${track.id}`, // Add trending prefix to ensure unique IDs
            name: track.name,
            artists: track.artists,
            album: track.album,
            preview_url: track.preview_url,
            external_urls: track.external_urls,
            popularity: track.popularity,
            duration_ms: track.duration_ms,
          }
        })
        .slice(0, limit)
    } catch (error) {
      console.error('Error getting trending tracks:', error)
      return this.getMockTracks(limit, `trending-page${page}`)
    }
  }

  private getMockTracks(limit: number, prefix: string = 'mock'): SpotifyTrack[] {
    console.warn('� USING MOCK SPOTIFY DATA - replace with valid credentials for real music data')
    console.warn('📖 Get credentials at: https://developer.spotify.com/dashboard')
    
    const timestamp = Date.now()
    const randomSeed = Math.floor(Math.random() * 1000)
    
    const artists = ['Ed Sheeran', 'The Weeknd', 'Harry Styles', 'Olivia Rodrigo', 'Dua Lipa', 'Taylor Swift', 'Drake', 'Billie Eilish', 'Post Malone', 'Ariana Grande']
    const albums = ['Greatest Hits', 'Latest Album', 'Chart Toppers', 'New Release', 'Popular Songs']
    
    const mockTracks = Array.from({ length: Math.max(limit, 20) }, (_, i) => {
      const artistIndex = (i + randomSeed) % artists.length
      const albumIndex = (i + randomSeed) % albums.length
      return {
        id: `${prefix}-${i + 1}-${timestamp}`,
        name: `[MOCK DATA] Song ${i + 1}`,
        artists: [{ name: artists[artistIndex] }],
        album: {
          name: albums[albumIndex],
          images: [{ url: `https://picsum.photos/300/300?random=${randomSeed + i + 1}` }],
          release_date: new Date(2020 + (i % 4), (i % 12), (i % 28) + 1).toISOString().split('T')[0]
        },
        preview_url: null,
        external_urls: { spotify: `https://open.spotify.com/track/${prefix}-${i + 1}` },
        popularity: 70 + (i % 30),
        duration_ms: 180000 + (i * 1000)
      }
    })

    return mockTracks.slice(0, limit)
  }
}

export default SpotifyService
