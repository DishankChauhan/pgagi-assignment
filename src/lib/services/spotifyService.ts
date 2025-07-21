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
      console.warn('Spotify credentials not configured, using mock data')
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
        console.warn('Spotify API authentication failed:', response.status, errorText)
        throw new Error(`Spotify API authentication failed: ${response.status}`)
      }

      const data = await response.json()
      this.clientCredentialsToken = data.access_token
      return this.clientCredentialsToken!
    } catch (error) {
      console.warn('Error getting Spotify token, falling back to mock data:', error)
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
      const data = await this.makeSpotifyRequest(`search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`)
      
      if (!data?.tracks?.items) {
        return this.getMockTracks(limit)
      }

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
      return this.getMockTracks(limit)
    }
  }

  async getTopTracks(limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const data = await this.makeSpotifyRequest(`browse/featured-playlists?limit=1`)
      
      if (!data?.playlists?.items?.[0]) {
        return this.getMockTracks(limit)
      }

      const playlistId = data.playlists.items[0].id
      const tracksData = await this.makeSpotifyRequest(`playlists/${playlistId}/tracks?limit=${limit}`)
      
      if (!tracksData?.items) {
        return this.getMockTracks(limit)
      }

      return tracksData.items
        .filter((item: Record<string, unknown>) => item.track && (item.track as Record<string, unknown>).type === 'track')
        .map((item: Record<string, unknown>) => {
          const track = item.track as Record<string, unknown>
          return {
            id: track.id,
            name: track.name,
            artists: track.artists,
            album: track.album,
            preview_url: track.preview_url,
            external_urls: track.external_urls,
            popularity: track.popularity,
            duration_ms: track.duration_ms,
          }
        })
    } catch (error) {
      console.error('Error getting top tracks:', error)
      return this.getMockTracks(limit)
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

  async getTrendingTracks(limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      // For trending, we could fetch from a different endpoint or use different data
      // For now, we'll use the same logic as getTopTracks but with different mock IDs
      const data = await this.makeSpotifyRequest(`browse/featured-playlists?limit=1`)
      
      if (!data?.playlists?.items?.[0]) {
        return this.getMockTracks(limit, 'trending')
      }

      const playlistId = data.playlists.items[0].id
      const tracksData = await this.makeSpotifyRequest(`playlists/${playlistId}/tracks?limit=${limit}`)
      
      if (!tracksData?.items) {
        return this.getMockTracks(limit, 'trending')
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
      return this.getMockTracks(limit, 'trending')
    }
  }

  private getMockTracks(limit: number, prefix: string = 'mock'): SpotifyTrack[] {
    const mockTracks = [
      {
        id: `${prefix}-1`,
        name: 'Shape of You',
        artists: [{ name: 'Ed Sheeran' }],
        album: {
          name: '÷ (Divide)',
          images: [{ url: 'https://picsum.photos/300/300?random=1' }],
          release_date: '2017-03-03'
        },
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3' },
        popularity: 89,
        duration_ms: 233713
      },
      {
        id: `${prefix}-2`, 
        name: 'Blinding Lights',
        artists: [{ name: 'The Weeknd' }],
        album: {
          name: 'After Hours',
          images: [{ url: 'https://picsum.photos/300/300?random=2' }],
          release_date: '2020-03-20'
        },
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b' },
        popularity: 95,
        duration_ms: 200040
      },
      {
        id: `${prefix}-3`,
        name: 'Watermelon Sugar',
        artists: [{ name: 'Harry Styles' }],
        album: {
          name: 'Fine Line',
          images: [{ url: 'https://picsum.photos/300/300?random=3' }],
          release_date: '2019-12-13'
        },
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/track/6UelLqGlWMcVH1E5c4H7lY' },
        popularity: 88,
        duration_ms: 174000
      },
      {
        id: `${prefix}-4`,
        name: 'Good 4 U',
        artists: [{ name: 'Olivia Rodrigo' }],
        album: {
          name: 'SOUR',
          images: [{ url: 'https://picsum.photos/300/300?random=4' }],
          release_date: '2021-05-21'
        },
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/track/4ZtFanR9U6ndgddUvNcjcG' },
        popularity: 92,
        duration_ms: 178000
      },
      {
        id: `${prefix}-5`,
        name: 'Levitating',
        artists: [{ name: 'Dua Lipa' }],
        album: {
          name: 'Future Nostalgia',
          images: [{ url: 'https://picsum.photos/300/300?random=5' }],
          release_date: '2020-03-27'
        },
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9' },
        popularity: 90,
        duration_ms: 203040
      }
    ]

    return mockTracks.slice(0, limit)
  }
}

export default SpotifyService
