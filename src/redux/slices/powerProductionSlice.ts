import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import moment from 'moment'

import axios from '../../axiosConfig'
import { AggregationPeriodType, type PowerStationsCount } from '../../components/common/types'
import { type RootState } from '../store'

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
    return await fetchPowerProduction(61, AggregationPeriodType.Minute, rejectWithValue)
  }
)

export const fetchLast48HoursPowerProduction = createAsyncThunk(
  'powerProduction/fetchLast48Hours',
  async (_, { rejectWithValue }) => {
    return await fetchPowerProduction(48, AggregationPeriodType.Hour, rejectWithValue)
  }
)

export const fetchLast60DaysPowerProduction = createAsyncThunk(
  'powerProduction/fetchLast60Days',
  async (_, { rejectWithValue }) => {
    return await fetchPowerProduction(60, AggregationPeriodType.Day, rejectWithValue)
  }
)

const fetchPowerProduction = async (
  duration: number,
  aggregationPeriodType: AggregationPeriodType,
  rejectWithValue: any
): Promise<any> => {
  return await axios.get('/aggregated-power-production',
    { params: { duration, aggregationPeriodType } })
    .then(response => {
      return response.data.reverse().slice(0, duration - 1)
    }).catch(error => {
      console.error(error)
      return rejectWithValue(error)
    })
}

export interface PowerProductionAggregation {
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
        state.last60MinutesDataset = fillDatasetWithValues(transformDataset(action.payload), 60, AggregationPeriodType.Minute)
        state.actualPowerProduction = state.last60MinutesDataset[state.last60MinutesDataset.length - 1]?.aggregatedValue
      })
      .addCase(fetchLast48HoursPowerProduction.fulfilled, (state, action: PayloadAction<PowerProductionAggregation[]>) => {
        state.last48HoursDataset = fillDatasetWithValues(transformDataset(action.payload), 48, AggregationPeriodType.Hour)
      })
      .addCase(fetchLast60DaysPowerProduction.fulfilled, (state, action: PayloadAction<PowerProductionAggregation[]>) => {
        state.last60DaysDataset = fillDatasetWithValues(transformDataset(action.payload), 60, AggregationPeriodType.Day)
      })
      .addCase(fetchPowerStationsCount.fulfilled, (state, action: PayloadAction<PowerStationsCount>) => {
        state.allPowerStations = action.payload.WORKING + action.payload.DAMAGED + action.payload.STOPPED + action.payload.MAINTENANCE
        state.runningPowerStations = action.payload.WORKING
        state.powerStationsMaintenance = action.payload.MAINTENANCE
      })
  }
})

export const transformDataset = (dataset: PowerProductionAggregation[]): PowerProductionAggregation[] => {
  return dataset.map((element) => {
    return { aggregatedValue: element.aggregatedValue ?? undefined, timestamp: new Date(element.timestamp) }
  })
}

export const fillDatasetWithValues = (dataset: PowerProductionAggregation[], duration: number, aggregationPeriodType: AggregationPeriodType): PowerProductionAggregation[] => {
  const result = [...dataset]
  let nextDate = new Date(dataset.at(0)?.timestamp ?? getFirstDate(aggregationPeriodType))
  if (dataset.length < duration) {
    const unit = toUnit(aggregationPeriodType)
    for (let i = dataset.length; i <= duration; i++) {
      nextDate = moment(nextDate).subtract(1, unit).toDate()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      result.unshift({ timestamp: nextDate, aggregatedValue: undefined })
    }
  }
  return result
}

export const toUnit = (aggregationPeriodType: AggregationPeriodType): 'day' | 'hour' | 'minute' => {
  switch (aggregationPeriodType) {
    case AggregationPeriodType.Day:
      return 'day'
    case AggregationPeriodType.Hour:
      return 'hour'
    case AggregationPeriodType.Minute:
      return 'minute'
  }
}

export const getFirstDate = (aggregationPeriodType: AggregationPeriodType): Date => {
  const firstDate = new Date()
  switch (aggregationPeriodType) {
    case AggregationPeriodType.Minute:
      firstDate.setSeconds(0)
      firstDate.setMilliseconds(0)
      break
    case AggregationPeriodType.Hour:
      firstDate.setMinutes(0)
      firstDate.setSeconds(0)
      firstDate.setMilliseconds(0)
      break
    case AggregationPeriodType.Day:
      firstDate.setHours(0)
      firstDate.setMinutes(0)
      firstDate.setSeconds(0)
      firstDate.setMilliseconds(0)
  }
  return firstDate
}

export const selectActualPowerProduction = (state: RootState): number | undefined => state.powerProduction.actualPowerProduction
export const selectAllPowerStations = (state: RootState): number | undefined => state.powerProduction.allPowerStations
export const selectRunningPowerStations = (state: RootState): number | undefined => state.powerProduction.runningPowerStations
export const selectPowerStationsMaintenance = (state: RootState): number | undefined => state.powerProduction.powerStationsMaintenance
export const selectLast60MinutesDataset = (state: RootState): PowerProductionAggregation[] => state.powerProduction.last60MinutesDataset
export const selectLast48HoursDataset = (state: RootState): PowerProductionAggregation[] => state.powerProduction.last48HoursDataset
export const selectLast60DaysDataset = (state: RootState): PowerProductionAggregation[] => state.powerProduction.last60DaysDataset
export default powerProductionSlice.reducer
