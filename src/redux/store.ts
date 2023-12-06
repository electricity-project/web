import { configureStore } from '@reduxjs/toolkit'
import powerStationsCreatorSlice from './slices/powerStationCreatorSlice'

const store = configureStore({
  reducer: {
    powerStationsCreator: powerStationsCreatorSlice
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
