'use client'

import { useAppSelector } from '@/lib/hooks'

export default function DebugDataDisplay() {
  const { music } = useAppSelector((state) => state.content)

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-sm max-h-60 overflow-y-auto text-xs z-50">
      <h3 className="font-bold mb-2">Debug: Music Data</h3>
      <p className="mb-2">Tracks loaded: {music.tracks.length}</p>
      {music.tracks.slice(0, 3).map((track, idx) => (
        <div key={track.id} className="mb-2 border-b border-gray-600 pb-1">
          <p><strong>#{idx + 1}:</strong> {track.name}</p>
          <p><em>by {track.artists.map(a => a.name).join(', ')}</em></p>
          <p className="text-xs text-gray-400">ID: {track.id.substring(0, 20)}...</p>
        </div>
      ))}
      {music.tracks.length === 0 && <p className="text-yellow-400">No tracks loaded yet</p>}
    </div>
  )
}
