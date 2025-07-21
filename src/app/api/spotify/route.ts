import { NextRequest, NextResponse } from 'next/server'
import SpotifyService from '@/lib/services/spotifyService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'top'
    const query = searchParams.get('query') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    const spotifyService = SpotifyService.getInstance()

    let tracks = []

    switch (type) {
      case 'search':
        tracks = await spotifyService.searchTracks(query, limit)
        break
      case 'recommendations':
        const genres = searchParams.get('genres')?.split(',') || ['pop', 'rock']
        tracks = await spotifyService.getRecommendations(genres, limit)
        break
      case 'trending':
        tracks = await spotifyService.getTrendingTracks(limit, page)
        break
      case 'top':
      default:
        tracks = await spotifyService.getTopTracks(limit, page)
        break
    }

    return NextResponse.json({ tracks, page })
  } catch (error) {
    console.error('Spotify API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch music data' },
      { status: 500 }
    )
  }
}
