import { type AlertColor } from '@mui/material'
import type { GridRowId, GridSortDirection, GridValidRowModel } from '@mui/x-data-grid'
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import axios from '../../axiosConfig'
import {
  type PowerStationProps,
  type PowerStationState as PowerStationStateType,
  type PowerStationType
} from '../../components/common/types'
import { type RootState } from '../store'

interface FetchPowerStationsProps {
  page: number
  pageSize: number
  sort: GridSortDirection
  field: string
  ipv6Patterns: Set<string>
  statePatterns: Set<PowerStationStateType>
  typePatterns: Set<PowerStationType>
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
    return await axios.post('/power-station',
      {
        ipv6Patterns: Array.from(props.ipv6Patterns),
        statePatterns: Array.from(props.statePatterns),
        typePatterns: Array.from(props.typePatterns)
      }, { params })
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

export const startPowerStation = createAsyncThunk<any, PowerStationProps>(
  'powerStations/start',
  async (props, { rejectWithValue }) => {
    return await axios.get('/power-station/start',
      {
        params: { ipv6: props.ipv6 }
      }).then(response => {
      return response.data
    }).catch(error => {
      console.error(error)
      return rejectWithValue(error)
    })
  }
)

export const stopPowerStation = createAsyncThunk<any, PowerStationProps>(
  'powerStations/stop',
  async (props, { rejectWithValue }) => {
    return await axios.get('/power-station/stop',
      {
        params: { ipv6: props.ipv6 }
      }).then(response => {
      return response.data
    }).catch(error => {
      console.error(error)
      return rejectWithValue(error)
    })
  }
)

export const disconnectPowerStation = createAsyncThunk<any, PowerStationProps>(
  'powerStations/disconnect',
  async (props, { rejectWithValue }) => {
    return await axios.get('/power-station/disconnect',
      {
        params: { ipv6: props.ipv6 }
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
  disconnectConfirmDialog: PowerStationProps | undefined
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
  disconnectConfirmDialog: undefined
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
      state.disconnectConfirmDialog = action.payload
    },
    closeDisconnectConfirmDialog: (state) => {
      state.isDisconnectConfirmDialogOpen = false
      state.disconnectConfirmDialog = undefined
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
        state.allRowsCount = action.payload.totalElements
      })
      .addCase(fetchPowerStations.rejected, (state) => {
        state.isLoading = false
      })
      .addCase(startPowerStation.pending, (state, action) => {
        state.pendingRows[action.meta.arg.id] = PendingRowReason.Start
      })
      .addCase(startPowerStation.fulfilled, (state, action) => {
        removeFromPendingRows(state, action.meta.arg.id)
      })
      .addCase(startPowerStation.rejected, (state, action) => {
        removeFromPendingRows(state, action.meta.arg.id)
        state.alertsQueue = [...state.alertsQueue, { key: new Date().getTime(), message: 'Nie udało się uruchomić pracy elektrowni', severity: 'error' }]
      })
      .addCase(stopPowerStation.pending, (state, action) => {
        state.pendingRows[action.meta.arg.id] = PendingRowReason.Stop
      })
      .addCase(stopPowerStation.fulfilled, (state, action) => {
        removeFromPendingRows(state, action.meta.arg.id)
      })
      .addCase(stopPowerStation.rejected, (state, action) => {
        removeFromPendingRows(state, action.meta.arg.id)
        state.alertsQueue = [...state.alertsQueue, { key: new Date().getTime(), message: 'Nie udało się zatrzymać pracy elektrowni', severity: 'error' }]
      })
      .addCase(disconnectPowerStation.pending, (state, action) => {
        state.pendingRows[action.meta.arg.id] = PendingRowReason.Disconnect
      })
      .addCase(disconnectPowerStation.fulfilled, (state, action) => {
        removeFromPendingRows(state, action.meta.arg.id)
        state.alertsQueue = [...state.alertsQueue, { key: new Date().getTime(), message: 'Pomyślnie odłączono elektrownię od systemu', severity: 'success' }]
      })
      .addCase(disconnectPowerStation.rejected, (state, action) => {
        removeFromPendingRows(state, action.meta.arg.id)
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
export const selectDisconnectConfirmDialog = (state: RootState): PowerStationProps | undefined => state.powerStations.disconnectConfirmDialog
export default powerStationsSlice.reducer
