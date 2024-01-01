import { configureStore } from '@reduxjs/toolkit'
import powerStationsCreatorSlice from './slices/powerStationsCreatorSlice'
import powerStationsSlice from './slices/powerStationsSlice'
import powerStationDetailsSlice from './slices/powerStationDetailsSlice'
import powerProductionSlice from './slices/powerProductionSlice'
import adminPanelSlice from './slices/adminPanelSlice'

const store = configureStore({
  reducer: {
    powerProduction: powerProductionSlice,
    powerStations: powerStationsSlice,
    powerStationDetails: powerStationDetailsSlice,
    powerStationsCreator: powerStationsCreatorSlice,
    adminPanel: adminPanelSlice
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
