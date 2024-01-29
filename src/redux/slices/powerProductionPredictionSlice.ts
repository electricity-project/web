import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import axios from '../../axiosConfig'
import { type PowerStationsCount, type PowerStationsScope } from '../../components/common/types'
import { type RootState } from '../store'

interface PowerPredictionProps {
  date: string
  powerStationsScope: PowerStationsScope
}

export const fetchPowerProductionPrediction = createAsyncThunk<PowerProductionPrediction[], PowerPredictionProps>(
  'powerProductionPrediction/fetchPowerProductionPrediction',
  async (props, { rejectWithValue }) => {
    return await axios.get('/power-production-prediction',
      { params: props })
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

export const fetchPowerStationsCount = createAsyncThunk<PowerStationsCount>(
  'powerProductionPrediction/fetchPowerStationsCount',
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

export interface PowerProductionPrediction {
  powerProduction: number
  runningPowerStationsNumber: number
  timestamp: Date
}

interface PowerProductionState {
  isLoading: boolean
  isError: boolean
  isPrediction: boolean
  powerProductionPrediction: PowerProductionPrediction[] | undefined
  allDayPowerProductionPrediction: number | undefined
  allPowerStations: number | undefined
  workingPowerStations: number | undefined
}

const initialState: PowerProductionState = {
  isLoading: false,
  isError: false,
  isPrediction: false,
  powerProductionPrediction: undefined,
  allDayPowerProductionPrediction: undefined,
  allPowerStations: undefined,
  workingPowerStations: undefined
}

const powerProductionPredictionSlice = createSlice({
  name: 'powerProductionPrediction',
  initialState,
  reducers: {
    reset: () => initialState,
    clearPowerProductionPrediction: (state) => {
      state.isPrediction = false
      state.isLoading = false
      state.isError = false
      state.powerProductionPrediction = undefined
      state.allDayPowerProductionPrediction = undefined
      state.workingPowerStations = undefined
      state.allPowerStations = undefined
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPowerProductionPrediction.pending, (state) => {
        state.isPrediction = true
        state.isLoading = true
        state.isError = false
      })
      .addCase(fetchPowerProductionPrediction.fulfilled, (state, action) => {
        const powerProductionPrediction = transformDataset(action.payload)
        state.powerProductionPrediction = powerProductionPrediction
        state.allDayPowerProductionPrediction = powerProductionPrediction
          .map((prediction) => prediction.powerProduction)
          .reduce((accumulator, prediction) => {
            return prediction === undefined ? accumulator : accumulator + prediction
          }, 0)
        state.isLoading = false
      })
      .addCase(fetchPowerProductionPrediction.rejected, (state) => {
        state.isPrediction = false
        state.isLoading = false
        state.isError = true
      })
      .addCase(fetchPowerStationsCount.pending, (state) => {
        state.isPrediction = true
      })
      .addCase(fetchPowerStationsCount.fulfilled, (state, action) => {
        state.allPowerStations = action.payload.WORKING + action.payload.DAMAGED + action.payload.STOPPED + action.payload.MAINTENANCE + action.payload.STOPPED_BY_USER
        state.workingPowerStations = action.payload.WORKING + action.payload.STOPPED + action.payload.STOPPED_BY_USER
      })
  }
})

export const transformDataset = (dataset: PowerProductionPrediction[]): PowerProductionPrediction[] => {
  return dataset.map((element) => {
    return {
      powerProduction: element.powerProduction ?? undefined,
      runningPowerStationsNumber: element.runningPowerStationsNumber ?? undefined,
      timestamp: new Date(element.timestamp)
    }
  })
}

export const {
  reset,
  clearPowerProductionPrediction
} = powerProductionPredictionSlice.actions

export const selectIsPrediction = (state: RootState): boolean => state.powerProductionPrediction.isPrediction
export const selectIsLoading = (state: RootState): boolean => state.powerProductionPrediction.isLoading
export const selectIsError = (state: RootState): boolean => state.powerProductionPrediction.isError
export const selectPowerProductionPrediction = (state: RootState): PowerProductionPrediction[] | undefined => state.powerProductionPrediction.powerProductionPrediction
export const selectAllDayPowerProductionPrediction = (state: RootState): number | undefined => state.powerProductionPrediction.allDayPowerProductionPrediction
export const selectAllPowerStations = (state: RootState): number | undefined => state.powerProductionPrediction.allPowerStations
export const selectWorkingPowerStations = (state: RootState): number | undefined => state.powerProductionPrediction.workingPowerStations
export default powerProductionPredictionSlice.reducer
