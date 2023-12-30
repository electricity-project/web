import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type RootState } from '../store'
import axios from '../../axiosConfig'
import type { GridRowId, GridSortDirection, GridValidRowModel } from '@mui/x-data-grid'
import { type AlertColor } from '@mui/material'

interface FetchPowerStationsProps {
  page: number
  pageSize: number
  sort: GridSortDirection
  field: string
  ipv6Patterns: Set<string>
  statePatterns: Set<string>
  typePatterns: Set<string>
}

export const fetchPowerStations = createAsyncThunk(
  'powerStations/fetch',
  async (props: FetchPowerStationsProps, { rejectWithValue }) => {
    let params: any = {
      page: props.page,
      size: props.pageSize
    }
    if (props.sort !== undefined) {
      params = {
        ...params,
        sort: `${props.field},${props.sort}`
      }
    }
    return await axios.get('/power-station', { params })
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

export const startPowerStation = createAsyncThunk(
  'powerStations/start',
  async (id: GridRowId, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return await axios.get('/power-station/start',
      {
        params: { id }
      }).then(response => {
      return response.data
    }).catch(error => {
      console.error(error)
      return rejectWithValue(error)
    })
  }
)

export const stopPowerStation = createAsyncThunk(
  'powerStations/stop',
  async (id: GridRowId, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return await axios.get('/power-station/stop',
      {
        params: { id }
      }).then(response => {
      return response.data
    }).catch(error => {
      console.error(error)
      return rejectWithValue(error)
    })
  }
)

export const disconnectPowerStation = createAsyncThunk(
  'powerStations/disconnect',
  async (id: GridRowId, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return await axios.get('/power-station/disconnect',
      {
        params: { id }
      }).then(response => {
      return response.data
    }).catch(error => {
      console.error(error)
      return rejectWithValue(error)
    })
  }
)

enum PendingRowReason {
  Start = 'START',
  Stop = 'STOP',
  Disconnect = 'DISCONNECT'
}

type PendingRows = Record<GridRowId, string>

interface AlertProps {
  key: number
  message: string
  severity: AlertColor
}

interface PowerStationState {
  rows: GridValidRowModel[]
  allRowsCount: number
  pendingRows: PendingRows
  isLoading: boolean
  isAlertVisible: boolean
  alertsQueue: readonly AlertProps[]
  alertProps: AlertProps | undefined
  isDisconnectConfirmDialogOpen: boolean
  disconnectConfirmDialogId: GridRowId | undefined
}

const initialState: PowerStationState = {
  rows: [],
  allRowsCount: 0,
  pendingRows: {},
  isLoading: false,
  isAlertVisible: false,
  alertsQueue: [],
  alertProps: undefined,
  isDisconnectConfirmDialogOpen: false,
  disconnectConfirmDialogId: undefined
}

const powerStationsSlice = createSlice({
  name: 'powerStations',
  initialState,
  reducers: {
    reset: (state) => {
      Object.assign(state, { ...initialState, pendingRows: state.pendingRows })
    },
    clearAlert: (state) => {
      state.isAlertVisible = false
    },
    clearAlertProps: (state) => {
      state.alertProps = undefined
    },
    addAlertToQueue: (state, action: PayloadAction<AlertProps>) => {
      state.alertsQueue = [...state.alertsQueue, action.payload]
    },
    updateAlert: (state) => {
      state.alertProps = state.alertsQueue[0]
      state.alertsQueue = state.alertsQueue.slice(1)
      state.isAlertVisible = true
    },
    openDisconnectConfirmDialog: (state, action) => {
      state.isDisconnectConfirmDialogOpen = true
      state.disconnectConfirmDialogId = action.payload
    },
    closeDisconnectConfirmDialog: (state) => {
      state.isDisconnectConfirmDialogOpen = false
      state.disconnectConfirmDialogId = undefined
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPowerStations.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchPowerStations.fulfilled, (state, action) => {
        state.isLoading = false
        state.rows = action.payload.content
        state.allRowsCount = action.payload.pageMetadata.totalElements
      })
      .addCase(fetchPowerStations.rejected, (state) => {
        state.isLoading = false
      })
      .addCase(startPowerStation.pending, (state, action) => {
        state.pendingRows[action.meta.arg] = PendingRowReason.Start
      })
      .addCase(startPowerStation.fulfilled, (state, action) => {
        removeFromPendingRows(state, action.meta.arg)
      })
      .addCase(startPowerStation.rejected, (state, action) => {
        removeFromPendingRows(state, action.meta.arg)
        state.alertsQueue = [...state.alertsQueue, { key: new Date().getTime(), message: 'Nie udało się uruchomić pracy elektrowni', severity: 'error' }]
      })
      .addCase(stopPowerStation.pending, (state, action) => {
        state.pendingRows[action.meta.arg] = PendingRowReason.Stop
      })
      .addCase(stopPowerStation.fulfilled, (state, action) => {
        removeFromPendingRows(state, action.meta.arg)
      })
      .addCase(stopPowerStation.rejected, (state, action) => {
        removeFromPendingRows(state, action.meta.arg)
        state.alertsQueue = [...state.alertsQueue, { key: new Date().getTime(), message: 'Nie udało się zatrzymać pracy elektrowni', severity: 'error' }]
      })
      .addCase(disconnectPowerStation.pending, (state, action) => {
        state.pendingRows[action.meta.arg] = PendingRowReason.Disconnect
      })
      .addCase(disconnectPowerStation.fulfilled, (state, action) => {
        removeFromPendingRows(state, action.meta.arg)
      })
      .addCase(disconnectPowerStation.rejected, (state, action) => {
        removeFromPendingRows(state, action.meta.arg)
        state.alertsQueue = [...state.alertsQueue, { key: new Date().getTime(), message: 'Nie udało się odłączyć elektrowni od systemu', severity: 'error' }]
      })
  }
})

const removeFromPendingRows = (state: PowerStationState, id: GridRowId): void => {
  const { [id]: _, ...pendingRows } = state.pendingRows
  state.pendingRows = pendingRows
}

export const {
  reset,
  clearAlert,
  clearAlertProps,
  updateAlert,
  addAlertToQueue,
  openDisconnectConfirmDialog,
  closeDisconnectConfirmDialog
} = powerStationsSlice.actions
export const selectRows = (state: RootState): GridValidRowModel[] => state.powerStations.rows
export const selectAllRowsCount = (state: RootState): number => state.powerStations.allRowsCount
export const selectPendingRows = (state: RootState): PendingRows => state.powerStations.pendingRows
export const selectIsLoading = (state: RootState): boolean => state.powerStations.isLoading
export const selectIsAlertVisible = (state: RootState): boolean => state.powerStations.isAlertVisible
export const selectAlertsQueue = (state: RootState): readonly AlertProps[] => state.powerStations.alertsQueue
export const selectAlertProps = (state: RootState): AlertProps | undefined => state.powerStations.alertProps
export const selectIsDisconnectConfirmDialogOpen = (state: RootState): boolean => state.powerStations.isDisconnectConfirmDialogOpen
export const selectDisconnectConfirmDialogId = (state: RootState): GridRowId | undefined => state.powerStations.disconnectConfirmDialogId
export default powerStationsSlice.reducer
