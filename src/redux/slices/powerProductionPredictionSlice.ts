import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import axios from '../../axiosConfig'
import { type PowerStationsCount, type PowerStationsScope } from '../../components/common/types'
import { type RootState } from '../store'

interface PowerPredictionProps {
  date: Date
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
  predictedValue: number
  timestamp: Date
}

interface PowerProductionState {
  isPrediction: boolean
  powerProductionPrediction: PowerProductionPrediction[] | undefined
  allDayPowerProductionPrediction: number | undefined
  allPowerStations: number | undefined
  workingPowerStations: number | undefined
}

const initialState: PowerProductionState = {
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
      })
      .addCase(fetchPowerProductionPrediction.fulfilled, (state, action) => {
        const powerProductionPrediction = transformDataset(action.payload)
        state.powerProductionPrediction = powerProductionPrediction
        state.allDayPowerProductionPrediction = powerProductionPrediction
          .map((prediction) => prediction.predictedValue)
          .reduce((accumulator, prediction) => {
            return prediction === undefined ? accumulator : accumulator + prediction
          }, 0)
      })
      .addCase(fetchPowerStationsCount.pending, (state) => {
        state.isPrediction = true
      })
      .addCase(fetchPowerStationsCount.fulfilled, (state, action) => {
        state.allPowerStations = action.payload.WORKING + action.payload.DAMAGED + action.payload.STOPPED + action.payload.MAINTENANCE
        state.workingPowerStations = action.payload.WORKING + action.payload.STOPPED
      })
  }
})

export const transformDataset = (dataset: PowerProductionPrediction[]): PowerProductionPrediction[] => {
  return dataset.map((element) => {
    return { predictedValue: element.predictedValue ?? undefined, timestamp: new Date(element.timestamp) }
  })
}

export const {
  reset,
  clearPowerProductionPrediction
} = powerProductionPredictionSlice.actions

export const selectIsPrediction = (state: RootState): boolean => state.powerProductionPrediction.isPrediction
export const selectPowerProductionPrediction = (state: RootState): PowerProductionPrediction[] | undefined => state.powerProductionPrediction.powerProductionPrediction
export const selectAllDayPowerProductionPrediction = (state: RootState): number | undefined => state.powerProductionPrediction.allDayPowerProductionPrediction
export const selectAllPowerStations = (state: RootState): number | undefined => state.powerProductionPrediction.allPowerStations
export const selectWorkingPowerStations = (state: RootState): number | undefined => state.powerProductionPrediction.workingPowerStations
export default powerProductionPredictionSlice.reducer
