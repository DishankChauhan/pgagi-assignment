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
      if (!this.clientCredentialsToken) {
        throw new Error('Spotify client credentials token is null')
      }
      if (this.clientCredentialsToken === null) {
        throw new Error('Spotify client credentials token is null')
      }
      return this.clientCredentialsToken!
    }

    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

      if (!clientId || !clientSecret) {
        throw new Error('Missing Spotify credentials. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your environment variables.')
      }

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
        },
        body: 'grant_type=client_credentials'
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('❌ Spotify token error:', error)
        throw new Error(`Failed to get Spotify token: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Successfully obtained Spotify access token')
      
      this.clientCredentialsToken = data.access_token
      
      // Clear token after expiry (minus 5 minutes buffer)
      setTimeout(() => {
        this.clientCredentialsToken = null
      }, (data.expires_in - 300) * 1000)
      
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
        console.warn('No tracks found in search')
        return []
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
      return []
    }
  }

  async getTopTracks(limit: number = 20, page: number = 1): Promise<SpotifyTrack[]> {
    try {
      console.log(`🎵 Fetching top tracks - page ${page}, limit ${limit}`)
      
      // Use a more popular search query for better results
      const popularQueries = ['pop', 'top hits', 'chart', 'trending', 'popular music']
      const query = popularQueries[(page - 1) % popularQueries.length]
      
      const data = await this.makeSpotifyRequest(`search?q=${query}&type=track&limit=${limit}&market=US&offset=${(page - 1) * limit}`)
      
      if (!data?.tracks?.items || data.tracks.items.length === 0) {
        console.warn('❌ No top tracks found from Spotify API')
        return []
      }

      const realTracks = data.tracks.items.map((track: Record<string, unknown>) => ({
        id: `${track.id}-page${page}`, // Add page suffix to ensure unique IDs
        name: track.name,
        artists: track.artists,
        album: track.album,
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        popularity: track.popularity,
        duration_ms: track.duration_ms,
      }))

      console.log(`✅ SUCCESS: Fetched ${realTracks.length} REAL Spotify tracks for page ${page}`)
      console.log(`🎵 Sample track: "${realTracks[0]?.name}" by ${realTracks[0]?.artists?.[0]?.name}`)
      
      return realTracks
    } catch (error) {
      console.error('❌ Error getting top tracks:', error)
      return []
    }
  }

  async getRecommendations(seedGenres: string[] = ['pop', 'rock'], limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const data = await this.makeSpotifyRequest(`recommendations?seed_genres=${seedGenres.join(',')}&limit=${limit}`)
      
      if (!data?.tracks) {
        return []
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
      return []
    }
  }

  async getTrendingTracks(limit: number = 20, page: number = 1): Promise<SpotifyTrack[]> {
    try {
      // For trending, we could fetch from a different endpoint or use different data
      // For now, we'll use the same logic as getTopTracks but with different trending prefix
      const data = await this.makeSpotifyRequest(`browse/featured-playlists?limit=1`)
      
      if (!data?.playlists?.items?.[0]) {
        return []
      }

      const playlistId = data.playlists.items[0].id
      const offset = (page - 1) * limit
      const tracksData = await this.makeSpotifyRequest(`playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`)
      
      if (!tracksData?.items) {
        return []
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
      return []
    }
  }
}

export default SpotifyService
