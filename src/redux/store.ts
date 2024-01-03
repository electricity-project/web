import { configureStore } from '@reduxjs/toolkit'

import adminPanelSlice from './slices/adminPanelSlice'
import powerProductionSlice from './slices/powerProductionSlice'
import powerStationDetailsSlice from './slices/powerStationDetailsSlice'
import powerStationsCreatorSlice from './slices/powerStationsCreatorSlice'
import powerStationsSlice from './slices/powerStationsSlice'
import userAuthSlice from './slices/userAuthSlice'

const store = configureStore({
  reducer: {
    powerProduction: powerProductionSlice,
    powerStations: powerStationsSlice,
    powerStationDetails: powerStationDetailsSlice,
    powerStationsCreator: powerStationsCreatorSlice,
    adminPanel: adminPanelSlice,
    userAuth: userAuthSlice
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
