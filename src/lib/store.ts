import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import { combineReducers } from '@reduxjs/toolkit'
import userPreferencesReducer from './features/userPreferencesSlice'
import contentReducer from './features/contentSlice'
import uiReducer from './features/uiSlice'

// Create a safe storage that works on both client and server
const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null)
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value)
    },
    removeItem() {
      return Promise.resolve()
    },
  }
}

// Dynamically import storage only on client side
let storage
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  storage = require('redux-persist/lib/storage').default
} else {
  storage = createNoopStorage()
}

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['userPreferences', 'ui'] // Only persist user preferences and UI state
}

export const rootReducer = combineReducers({
  userPreferences: userPreferencesReducer,
  content: contentReducer,
  ui: uiReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
