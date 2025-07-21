import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'
import userPreferencesReducer from './features/userPreferencesSlice'
import contentReducer from './features/contentSlice'
import uiReducer from './features/uiSlice'

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
