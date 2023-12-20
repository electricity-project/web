import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type RootState } from '../store'
import axios from '../../axiosConfig'

export const fetchPowerStationsCount = createAsyncThunk(
  'powerProduction/fetchPowerStationsCount',
  async (_, { rejectWithValue }) => {
    return await axios.get('/power-station/count')
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

export const fetchLast60MinutesPowerProduction = createAsyncThunk(
  'powerProduction/fetchLast60Minutes',
  async (_, { rejectWithValue }) => {
    return await fetchPowerProduction(61, PeriodType.Minute, rejectWithValue)
  }
)

export const fetchLast48HoursPowerProduction = createAsyncThunk(
  'powerProduction/fetchLast48Hours',
  async (_, { rejectWithValue }) => {
    return await fetchPowerProduction(49, PeriodType.Hour, rejectWithValue)
  }
)

export const fetchLast60DaysPowerProduction = createAsyncThunk(
  'powerProduction/fetchLast60Days',
  async (_, { rejectWithValue }) => {
    return await fetchPowerProduction(61, PeriodType.Day, rejectWithValue)
  }
)

const fetchPowerProduction = async (
  duration: number,
  periodType: PeriodType,
  rejectWithValue: any
): Promise<any> => {
  return await axios.get('/aggregated-power-production',
    { params: { duration, periodType } })
    .then(response => {
      return response.data
    }).catch(error => {
      console.error(error)
      return rejectWithValue(error)
    })
}

interface PowerStationsCount {
  WORKING: number
  STOPPED: number
  DAMAGED: number
  MAINTENANCE: number
}

enum PeriodType {
  Minute = 'MINUTE',
  Hour = 'HOUR',
  Day = 'DAY'
}

interface PowerProductionAggregation {
  aggregatedValue: number
  timestamp: Date
}

interface PowerProductionState {
  actualPowerProduction: number | undefined
  allPowerStations: number | undefined
  runningPowerStations: number | undefined
  powerStationsMaintenance: number | undefined
  last60MinutesDataset: PowerProductionAggregation[]
  last48HoursDataset: PowerProductionAggregation[]
  last60DaysDataset: PowerProductionAggregation[]
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
      .addCase(fetchLast60MinutesPowerProduction.fulfilled, (state, action: PayloadAction<PowerProductionAggregation[]>) => {
        state.last60MinutesDataset = timestampToDate(action.payload)
        state.actualPowerProduction = state.last60MinutesDataset[state.last60MinutesDataset.length - 1]?.aggregatedValue
      })
      .addCase(fetchLast48HoursPowerProduction.fulfilled, (state, action: PayloadAction<PowerProductionAggregation[]>) => {
        state.last48HoursDataset = timestampToDate(action.payload)
      })
      .addCase(fetchLast60DaysPowerProduction.fulfilled, (state, action: PayloadAction<PowerProductionAggregation[]>) => {
        state.last60DaysDataset = timestampToDate(action.payload)
      })
      .addCase(fetchPowerStationsCount.fulfilled, (state, action: PayloadAction<PowerStationsCount>) => {
        state.allPowerStations = action.payload.WORKING + action.payload.DAMAGED + action.payload.STOPPED + action.payload.MAINTENANCE
        state.runningPowerStations = action.payload.WORKING
        state.powerStationsMaintenance = action.payload.MAINTENANCE
      })
  }
})

const timestampToDate = (dataset: PowerProductionAggregation[]): PowerProductionAggregation[] => {
  return dataset.map((element) => {
    return { ...element, timestamp: new Date(element.timestamp) }
  })
}

export const selectActualPowerProduction = (state: RootState): number | undefined => state.powerProduction.actualPowerProduction
export const selectAllPowerStations = (state: RootState): number | undefined => state.powerProduction.allPowerStations
export const selectRunningPowerStations = (state: RootState): number | undefined => state.powerProduction.runningPowerStations
export const selectPowerStationsMaintenance = (state: RootState): number | undefined => state.powerProduction.powerStationsMaintenance
export const selectLast60MinutesDataset = (state: RootState): PowerProductionAggregation[] => state.powerProduction.last60MinutesDataset
export const selectLast48HoursDataset = (state: RootState): PowerProductionAggregation[] => state.powerProduction.last48HoursDataset
export const selectLast60DaysDataset = (state: RootState): PowerProductionAggregation[] => state.powerProduction.last60DaysDataset
export default powerProductionSlice.reducer
