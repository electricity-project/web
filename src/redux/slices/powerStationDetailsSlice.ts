import type { GridRowId } from '@mui/x-data-grid'
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import moment from 'moment/moment'

import axios from '../../axiosConfig'
import {
  AggregationPeriodType,
  type PowerStationProps,
  type PowerStationState,
  type PowerStationType
} from '../../components/common/types'
import { type RootState } from '../store'
import {
  getFirstDate, toUnit
} from './powerProductionSlice'

export const fetchPowerStationDetails = createAsyncThunk(
  'powerStationDetails/fetch',
  async (id: GridRowId, { rejectWithValue }) => {
    return await axios.get(`/power-station/${id}`)
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

export const fetchLast60MinutesPowerProduction = createAsyncThunk(
  'powerStationDetails/fetchLast60Minutes',
  async (ipv6: string, { rejectWithValue }) => {
    return await fetchPowerProduction(ipv6, 61, AggregationPeriodType.Minute, rejectWithValue)
  }
)

export const fetchLast48HoursPowerProduction = createAsyncThunk(
  'powerStationDetails/fetchLast48Hours',
  async (ipv6: string, { rejectWithValue }) => {
    return await fetchPowerProduction(ipv6, 48, AggregationPeriodType.Hour, rejectWithValue)
  }
)

export const fetchLast60DaysPowerProduction = createAsyncThunk(
  'powerStationDetails/fetchLast60Days',
  async (ipv6: string, { rejectWithValue }) => {
    return await fetchPowerProduction(ipv6, 60, AggregationPeriodType.Day, rejectWithValue)
  }
)

const fetchPowerProduction = async (
  ipv6: string,
  duration: number,
  aggregationPeriodType: AggregationPeriodType,
  rejectWithValue: any
): Promise<any> => {
  return await axios.get('/power-production',
    { params: { ipv6, duration, aggregationPeriodType } })
    .then(response => {
      return response.data.reverse().slice(0, duration - 1)
    }).catch(error => {
      console.error(error)
      return rejectWithValue(error)
    })
}

export interface PowerProduction {
  state: PowerStationState
  power: number
  timestamp: Date
}

export interface PowerStationDetails {
  id: number
  ipv6: string
  state: PowerStationState
  type: PowerStationType
  creationTime: Date
  maxPower: number
  actualPowerProduction: number
}

export interface WindTurbineDetails extends PowerStationDetails {
  bladeLength: number
}

export interface SolarPanelDetails extends PowerStationDetails {
  optimalTemperature: number
}

interface powerStationDetailsState {
  isLoadingDetails: boolean
  isDetailsError: boolean
  details: PowerStationDetails | undefined
  isDisconnectConfirmDialogOpen: boolean
  disconnectConfirmDialog: PowerStationProps | undefined
  last60MinutesDataset: PowerProduction[]
  last48HoursDataset: PowerProduction[]
  last60DaysDataset: PowerProduction[]
}

const initialState: powerStationDetailsState = {
  isLoadingDetails: true,
  isDetailsError: false,
  details: undefined,
  isDisconnectConfirmDialogOpen: false,
  disconnectConfirmDialog: undefined,
  last60MinutesDataset: [],
  last48HoursDataset: [],
  last60DaysDataset: []
}

const powerStationDetailsSlice = createSlice({
  name: 'powerStationDetails',
  initialState,
  reducers: {
    reset: () => initialState,
    openDisconnectConfirmDialog: (state, action) => {
      state.isDisconnectConfirmDialogOpen = true
      state.disconnectConfirmDialog = action.payload
    },
    closeDisconnectConfirmDialog: (state) => {
      state.isDisconnectConfirmDialogOpen = false
      state.disconnectConfirmDialog = undefined
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPowerStationDetails.pending, (state) => {
        state.isLoadingDetails = state.details === undefined
      })
      .addCase(fetchPowerStationDetails.fulfilled, (state, action: PayloadAction<any>) => {
        state.details = { ...action.payload, creationTime: new Date(action.payload.creationTime) }
        state.isDetailsError = false
      })
      .addCase(fetchPowerStationDetails.rejected, (state) => {
        state.isLoadingDetails = false
        state.isDetailsError = true
      })
      .addCase(fetchLast60MinutesPowerProduction.fulfilled, (state, action: PayloadAction<PowerProduction[]>) => {
        state.last60MinutesDataset = fillDatasetWithValues(transformDataset(action.payload), 60, AggregationPeriodType.Minute)
        if (state.details !== undefined) {
          state.details.actualPowerProduction = state.last60MinutesDataset[state.last60MinutesDataset.length - 1]?.power
        }
        state.isLoadingDetails = false
      })
      .addCase(fetchLast48HoursPowerProduction.fulfilled, (state, action: PayloadAction<PowerProduction[]>) => {
        state.last48HoursDataset = fillDatasetWithValues(transformDataset(action.payload), 48, AggregationPeriodType.Hour)
      })
      .addCase(fetchLast60DaysPowerProduction.fulfilled, (state, action: PayloadAction<PowerProduction[]>) => {
        state.last60DaysDataset = fillDatasetWithValues(transformDataset(action.payload), 60, AggregationPeriodType.Day)
      })
  }
})

export const transformDataset = (dataset: PowerProduction[]): PowerProduction[] => {
  return dataset.map((element) => {
    return { power: element.power ?? undefined, state: element.state ?? undefined, timestamp: new Date(element.timestamp) }
  })
}

export const fillDatasetWithValues = (dataset: PowerProduction[], duration: number, aggregationPeriodType: AggregationPeriodType): PowerProduction[] => {
  const result = [...dataset]
  let nextDate = new Date(dataset.at(0)?.timestamp ?? getFirstDate(aggregationPeriodType))
  if (dataset.length < duration) {
    const unit = toUnit(aggregationPeriodType)
    for (let i = dataset.length; i <= duration; i++) {
      nextDate = moment(nextDate).subtract(1, unit).toDate()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      result.unshift({ timestamp: nextDate })
    }
  }
  return result
}

export const {
  reset,
  openDisconnectConfirmDialog,
  closeDisconnectConfirmDialog
} = powerStationDetailsSlice.actions
export const selectIsLoadingDetails = (state: RootState): boolean => state.powerStationDetails.isLoadingDetails
export const selectIsDetailsError = (state: RootState): boolean => state.powerStationDetails.isDetailsError
export const selectDetails = (state: RootState): PowerStationDetails | undefined => state.powerStationDetails.details
export const selectIsDisconnectConfirmDialogOpen = (state: RootState): boolean => state.powerStationDetails.isDisconnectConfirmDialogOpen
export const selectDisconnectConfirmDialog = (state: RootState): PowerStationProps | undefined => state.powerStationDetails.disconnectConfirmDialog
export const selectLast60MinutesDataset = (state: RootState): PowerProduction[] => state.powerStationDetails.last60MinutesDataset
export const selectLast48HoursDataset = (state: RootState): PowerProduction[] => state.powerStationDetails.last48HoursDataset
export const selectLast60DaysDataset = (state: RootState): PowerProduction[] => state.powerStationDetails.last60DaysDataset
export default powerStationDetailsSlice.reducer
