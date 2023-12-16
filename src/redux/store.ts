import { configureStore } from '@reduxjs/toolkit'
import powerStationsCreatorSlice from './slices/powerStationsCreatorSlice'
import powerStationsSlice from './slices/powerStationsSlice'
import powerStationDetailsSlice from './slices/powerStationDetailsSlice'

const store = configureStore({
  reducer: {
    powerStations: powerStationsSlice,
    powerStationDetails: powerStationDetailsSlice,
    powerStationsCreator: powerStationsCreatorSlice
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
