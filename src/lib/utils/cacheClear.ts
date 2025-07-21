// Utility to clear all cached data and force reload
export const clearAllCaches = async () => {
  try {
    // Clear localStorage
    localStorage.clear()
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Clear Redux persist storage
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('persist:')) {
        localStorage.removeItem(key)
      }
    })
    
    // Clear browser cache if possible
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }
    
    console.log('✅ All caches cleared successfully')
    return true
  } catch (error) {
    console.error('❌ Error clearing caches:', error)
    return false
  }
}

export const forceMusicRefresh = () => {
  // Add timestamp to force fresh data
  const timestamp = Date.now()
  console.log(`🔄 Force refreshing music data at ${timestamp}`)
  
  // Dispatch refresh action with timestamp
  return timestamp
}
