import {
  type GridRowId, type GridRowModel, GridRowModes,
  type GridRowModesModel,
  type GridValidRowModel
} from '@mui/x-data-grid'
import { type GridRowModesModelProps } from '@mui/x-data-grid/models/api/gridEditingApi'
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import axios from '../../axiosConfig'
import { PowerStationCreationStatus, type PowerStationType } from '../../components/common/types'
import { type RootState } from '../store'

export const validatePowerStationByIpv6 = createAsyncThunk(
  'powerStationsCreator/validateByIpv6',
  async ({ ipv6, id }: { ipv6: string, id: GridRowId }, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return await axios.get('/power-station/validate',
      { params: { ipv6 } }
    ).then(response => {
      return response.data
    }).catch(error => {
      console.error(error)
      return rejectWithValue(error)
    })
  }
)

export const connectPowerStations = createAsyncThunk(
  'powerStationsCreator/connect',
  async (ipv6List: string[], { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return await axios.post('/power-station/connect', ipv6List)
      .then(response => {
        const notConnectedPowerStations = response.data as string[]
        return notConnectedPowerStations.length === 0 ? response.data : rejectWithValue(notConnectedPowerStations)
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

interface PowerStationCreatorState {
  newId: number
  rows: GridValidRowModel[]
  rowModesModel: GridRowModesModel
  isLoading: boolean
  isConnectionError: boolean
}

const initialState: PowerStationCreatorState = {
  newId: 0,
  rows: [],
  rowModesModel: {},
  isLoading: false,
  isConnectionError: false
}

interface SetRowModeType {
  id: GridRowId
  props: GridRowModesModelProps
}

const powerStationsCreatorSlice = createSlice({
  name: 'powerStationsCreator',
  initialState,
  reducers: {
    reset: () => initialState,
    clearConnectionError: (state) => {
      state.isConnectionError = false
    },
    addRow: (state, action: PayloadAction<GridValidRowModel>) => {
      state.rows.unshift({ ...action.payload, id: state.newId })
      state.rowModesModel[state.newId++] = { mode: GridRowModes.Edit, fieldToFocus: 'ipv6' }
    },
    updateRow: (state, action: PayloadAction<GridRowModel>) => {
      const rowIndex = state.rows.findIndex((row) => row.id === action.payload.id)
      if (rowIndex !== -1) {
        state.rows[rowIndex] = { ...state.rows[rowIndex], ...action.payload }
      }
    },
    deleteRowById: (state, action: PayloadAction<GridRowId>) => {
      state.rows = state.rows.filter((row) => row.id !== action.payload)
    },
    setNewRowModesModel: (state, action: PayloadAction<GridRowModesModel>) => {
      state.rowModesModel = action.payload
    },
    setRowMode: (state, action: PayloadAction<SetRowModeType>) => {
      state.rowModesModel[action.payload.id] = action.payload.props
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(validatePowerStationByIpv6.pending, (state, action) => {
        const row = getRowById(state, action.meta.arg.id)
        setStatus(row, PowerStationCreationStatus.Loading)
        setType(row, undefined)
      })
      .addCase(validatePowerStationByIpv6.fulfilled, (state, action: any) => {
        const row = getRowById(state, action.meta.arg.id)
        setStatus(row, PowerStationCreationStatus.Success)
        setType(row, action.payload.type)
      })
      .addCase(validatePowerStationByIpv6.rejected, (state, action: any) => {
        const row = getRowById(state, action.meta.arg.id)
        setStatus(row, PowerStationCreationStatus.Error)
        if (row !== undefined) {
          switch (action.payload.response.status) {
            case 404:
              row.error = 'Nie znaleziono elektrowni o podanym adresie IPv6'
              break
            default:
              row.error = 'Błąd weryfikacji elektrowni'
          }
        }
      })
      .addCase(connectPowerStations.pending, (state) => {
        state.isLoading = true
        state.isConnectionError = false
      })
      .addCase(connectPowerStations.fulfilled, () => initialState)
      .addCase(connectPowerStations.rejected, (state, action: any) => {
        if (action.payload.length !== undefined && action.payload.length !== 0) {
          const errorRows = getRowsByIpv6(state, action.payload)
          errorRows.forEach((errorRow) => {
            setStatus(errorRow, PowerStationCreationStatus.Error)
            errorRow.error = 'Błąd przy podłączaniu elektrowni'
          })
          state.rows = errorRows
        }
        state.isLoading = false
        state.isConnectionError = true
      })
  }
})

const getRowById = (state: PowerStationCreatorState, id: GridRowId): GridValidRowModel | undefined => {
  return state.rows.find((row) => row.id === id)
}

const getRowsByIpv6 = (state: PowerStationCreatorState, ipv6List: string[]): GridValidRowModel[] => {
  return state.rows.filter((row) => ipv6List.includes(row.ipv6))
}

const setStatus = (row: GridValidRowModel | undefined, status: PowerStationCreationStatus): void => {
  if (row !== undefined) {
    row.status = status
  }
}

const setType = (row: GridValidRowModel | undefined, type: PowerStationType | undefined): void => {
  if (row !== undefined) {
    row.type = type
  }
}

export const {
  reset,
  clearConnectionError,
  addRow,
  updateRow,
  deleteRowById,
  setRowMode,
  setNewRowModesModel
} = powerStationsCreatorSlice.actions
export const selectIsLoading = (state: RootState): boolean => state.powerStationsCreator.isLoading
export const selectIsConnectionError = (state: RootState): boolean => state.powerStationsCreator.isConnectionError
export const selectRows = (state: RootState): GridValidRowModel[] => state.powerStationsCreator.rows
export const selectRowsNumber = (state: RootState): number => state.powerStationsCreator.rows.length
export const selectRowModesModel = (state: RootState): GridRowModesModel => state.powerStationsCreator.rowModesModel
export default powerStationsCreatorSlice.reducer
