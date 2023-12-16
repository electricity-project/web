import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { type RootState } from '../store'
import axios from '../../axiosConfig'
import type { GridPaginationModel, GridRowId, GridSortItem, GridValidRowModel } from '@mui/x-data-grid'

export const fetchPowerStations = createAsyncThunk(
  'powerStations/fetch',
  async (props: GridPaginationModel & GridSortItem, { rejectWithValue }) => {
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

interface PowerStationState {
  rows: GridValidRowModel[]
  allRowsCount: number
  pendingRows: PendingRows
  isLoading: boolean
  isDisconnectConfirmDialogOpen: boolean
  disconnectConfirmDialogId: GridRowId | undefined
}

const initialState: PowerStationState = {
  rows: [],
  allRowsCount: 0,
  pendingRows: {},
  isLoading: false,
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
      .addCase(fetchPowerStations.rejected, (state, action: any) => {
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
      })
      .addCase(stopPowerStation.pending, (state, action) => {
        state.pendingRows[action.meta.arg] = PendingRowReason.Stop
      })
      .addCase(stopPowerStation.fulfilled, (state, action) => {
        removeFromPendingRows(state, action.meta.arg)
      })
      .addCase(stopPowerStation.rejected, (state, action) => {
        removeFromPendingRows(state, action.meta.arg)
      })
      .addCase(disconnectPowerStation.pending, (state, action) => {
        state.pendingRows[action.meta.arg] = PendingRowReason.Disconnect
      })
      .addCase(disconnectPowerStation.fulfilled, (state, action) => {
        removeFromPendingRows(state, action.meta.arg)
      })
      .addCase(disconnectPowerStation.rejected, (state, action) => {
        removeFromPendingRows(state, action.meta.arg)
      })
  }
})

const removeFromPendingRows = (state: PowerStationState, id: GridRowId): void => {
  const { [id]: _, ...pendingRows } = state.pendingRows
  state.pendingRows = pendingRows
}

export const {
  reset,
  openDisconnectConfirmDialog,
  closeDisconnectConfirmDialog
} = powerStationsSlice.actions
export const selectRows = (state: RootState): GridValidRowModel[] => state.powerStations.rows
export const selectAllRowsCount = (state: RootState): number => state.powerStations.allRowsCount
export const selectPendingRows = (state: RootState): PendingRows => state.powerStations.pendingRows
export const selectIsLoading = (state: RootState): boolean => state.powerStations.isLoading
export const selectIsDisconnectConfirmDialogOpen = (state: RootState): boolean => state.powerStations.isDisconnectConfirmDialogOpen
export const selectDisconnectConfirmDialogId = (state: RootState): GridRowId | undefined => state.powerStations.disconnectConfirmDialogId
export default powerStationsSlice.reducer
