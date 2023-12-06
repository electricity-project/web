import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type RootState } from '../store'
import axios from '../../axiosConfig'
import {
  type GridRowId, type GridRowModel, GridRowModes,
  type GridRowModesModel,
  type GridValidRowModel
} from '@mui/x-data-grid'
import { type GridRowModesModelProps } from '@mui/x-data-grid/models/api/gridEditingApi'

export const validatePowerStationByIpv6 = createAsyncThunk(
  'powerStationsCreator/validateByIpv6',
  async ({ ipv6, id }: { ipv6: string, id: GridRowId }, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 5000))
    switch (ipv6) {
      case '0000:0000:0000:0000:0000:0000:0000:0001':
      case '0000:0000:0000:0000:0000:0000:0000:0003':
        return { ipv6, type: 'Wiatrowa' }
      case '0000:0000:0000:0000:0000:0000:0000:0002':
        return { ipv6, type: 'Słoneczna' }
      default:
        return rejectWithValue({ response: { status: 404 } })
    }
    // return await axios.get('/power-stations/validate', { params: { ipv6 } }).then(response => {
    //   return response.data
    // }).catch(error => {
    //   console.error(error)
    //   return rejectWithValue(error)
    // })
  }
)

export const connectPowerStations = createAsyncThunk(
  'powerStationsCreator/connect',
  async (ipv6Array: string[], { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 3000))
    // return await axios.get('/power-stations/validate', { params: { ipv6 } }).then(response => {
    //   return response.data
    // }).catch(error => {
    //   console.error(error)
    //   return rejectWithValue(error)
    // })
  }
)

export enum PowerStationStatus {
  Success = 'success',
  Loading = 'loading',
  Error = 'error',
}

export enum PowerStationType {
  WindTurbine = 'Wiatrowa',
  SolarPanel = 'Słoneczna'
}

interface PowerStationCreatorState {
  newId: number
  rows: GridValidRowModel[]
  rowModesModel: GridRowModesModel
  isLoading: boolean
}

const initialState: PowerStationCreatorState = {
  newId: 0,
  rows: [
    // { id: 1, ipv6: '0000:0000:0000:0000:0000:0000:0000:0001', status: PowerStationStatus.Success, type: PowerStationType.WindTurbine },
    // { id: 2, ipv6: '0000:0000:0000:0000:0000:0000:0000:0002', status: PowerStationStatus.Loading, type: undefined },
    // { id: 3, ipv6: '0000:0000:0000:0000:0000:0000:0000:0003', status: PowerStationStatus.Error, type: PowerStationType.SolarPanel }
  ],
  rowModesModel: {},
  isLoading: false
}

interface SetRowModeType {
  id: GridRowId
  props: GridRowModesModelProps
}

const powerStationsCreatorSlice = createSlice({
  name: 'powerStationsCreator',
  initialState,
  reducers: {
    clear: () => initialState,
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
        setStatus(row, PowerStationStatus.Loading)
        setType(row, undefined)
      })
      .addCase(validatePowerStationByIpv6.fulfilled, (state, action: any) => {
        const row = getRowById(state, action.meta.arg.id)
        setStatus(row, PowerStationStatus.Success)
        setType(row, action.payload.type)
      })
      .addCase(validatePowerStationByIpv6.rejected, (state, action: any) => {
        const row = getRowById(state, action.meta.arg.id)
        setStatus(row, PowerStationStatus.Error)
        if (row !== undefined) {
          switch (action.payload.response.status) {
            case 404:
              row.error = 'Nie znaleziono elektrowni o podanym IPv6'
              break
            default:
              row.error = 'Błąd weryfikacji elektrowni'
          }
        }
      })
      .addCase(connectPowerStations.pending, (state) => {
        state.isLoading = true
      })
      .addCase(connectPowerStations.fulfilled, () => initialState)
      .addCase(connectPowerStations.rejected, (state) => {
        state.isLoading = false
      })
  }
})

const getRowById = (state: PowerStationCreatorState, id: GridRowId): GridValidRowModel | undefined => {
  return state.rows.find((row) => row.id === id)
}

const setStatus = (row: GridValidRowModel | undefined, status: PowerStationStatus): void => {
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
  clear,
  addRow,
  updateRow,
  deleteRowById,
  setRowMode,
  setNewRowModesModel
} = powerStationsCreatorSlice.actions
export const selectIsLoading = (state: RootState): boolean => state.powerStationsCreator.isLoading
export const selectRows = (state: RootState): GridValidRowModel[] => state.powerStationsCreator.rows
export const selectRowModesModel = (state: RootState): GridRowModesModel => state.powerStationsCreator.rowModesModel
export default powerStationsCreatorSlice.reducer
