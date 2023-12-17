import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { type RootState } from '../store'
import axios from '../../axiosConfig'
import { type DatasetType } from '@mui/x-charts/models/seriesType/config'

export const fetchPowerProduction = createAsyncThunk(
  'powerProduction/fetch',
  async (_, { rejectWithValue }) => {
    return await axios.get('/power-production')
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

interface PowerProductionState {
  actualPowerProduction: number | undefined
  allPowerStations: number | undefined
  runningPowerStations: number | undefined
  powerStationsMaintenance: number | undefined
  last60MinutesDataset: DatasetType
  last48HoursDataset: DatasetType
  last60DaysDataset: DatasetType
}

const initialState: PowerProductionState = {
  actualPowerProduction: undefined,
  allPowerStations: undefined,
  runningPowerStations: undefined,
  powerStationsMaintenance: undefined,
  last60MinutesDataset: [],
  last48HoursDataset: [],
  last60DaysDataset: []
}

const powerProductionSlice = createSlice({
  name: 'powerProduction',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPowerProduction.fulfilled, (state, action) => {
        state.actualPowerProduction = action.payload.last60Minutes[action.payload.last60Minutes.length - 1]?.aggregatedValue
        state.allPowerStations = action.payload.allPowerStations
        state.runningPowerStations = action.payload.runningPowerStations
        state.powerStationsMaintenance = action.payload.powerStationsMaintenance
        state.last60MinutesDataset = timestampToDate(action.payload.last60Minutes)
        state.last48HoursDataset = timestampToDate(action.payload.last48Hours)
        state.last60DaysDataset = timestampToDate(action.payload.last60Days)
      })
  }
})

const timestampToDate = (dataset: DatasetType): DatasetType => {
  return dataset.map((element) => {
    return { ...element, timestamp: new Date(element.timestamp) }
  })
}

export const selectActualPowerProduction = (state: RootState): number | undefined => state.powerProduction.actualPowerProduction
export const selectAllPowerStations = (state: RootState): number | undefined => state.powerProduction.allPowerStations
export const selectRunningPowerStations = (state: RootState): number | undefined => state.powerProduction.runningPowerStations
export const selectPowerStationsMaintenance = (state: RootState): number | undefined => state.powerProduction.powerStationsMaintenance
export const selectLast60MinutesDataset = (state: RootState): DatasetType => state.powerProduction.last60MinutesDataset
export const selectLast48HoursDataset = (state: RootState): DatasetType => state.powerProduction.last48HoursDataset
export const selectLast60DaysDataset = (state: RootState): DatasetType => state.powerProduction.last60DaysDataset
export default powerProductionSlice.reducer
