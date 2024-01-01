import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { type RootState } from '../store'
import axios from '../../axiosConfig'
import type {
  GridPaginationModel,
  GridRowId,
  GridSortItem,
  GridValidRowModel
} from '@mui/x-data-grid'
import { type AlertColor } from '@mui/material'

export const fetchUsers = createAsyncThunk(
  'adminPanel/fetchUsers',
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
    return await axios.get('/users', { params })
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

export const deleteUser = createAsyncThunk(
  'adminPanel/deleteUser',
  async (id: GridRowId, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return await axios.delete(`/users/${id}`)
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

export const fetchWeatherApiKey = createAsyncThunk(
  'adminPanel/fetchWeatherApiKey',
  async (_, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return await axios.get('/weather-api-key')
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

export const setWeatherApiKey = createAsyncThunk(
  'adminPanel/setWeatherApiKey',
  async (newWeatherApiKey: string, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return await axios.put('/weather-api-key', { apiKey: newWeatherApiKey })
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

enum PendingRowReason {
  Delete = 'DELETE'
}

type PendingRows = Record<GridRowId, string>

interface AlertProps {
  key: number
  message: string
  severity: AlertColor
}

interface AdminPanelState {
  rows: GridValidRowModel[]
  allRowsCount: number
  pendingRows: PendingRows
  isLoading: boolean
  isAlertVisible: boolean
  alertsQueue: readonly AlertProps[]
  alertProps: AlertProps | undefined
  isDeleteUserConfirmDialogOpen: boolean
  deleteUserConfirmDialogId: GridRowId | undefined
  isLoadingWeatherApiKey: boolean
  isWeatherApiKeyError: boolean
  weatherApiKey: string
}

const initialState: AdminPanelState = {
  rows: [],
  allRowsCount: 0,
  pendingRows: {},
  isLoading: false,
  isAlertVisible: false,
  alertsQueue: [],
  alertProps: undefined,
  isDeleteUserConfirmDialogOpen: false,
  deleteUserConfirmDialogId: undefined,
  isLoadingWeatherApiKey: false,
  isWeatherApiKeyError: false,
  weatherApiKey: ''
}

const adminPanelSlice = createSlice({
  name: 'adminPanel',
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
    updateAlert: (state) => {
      state.alertProps = state.alertsQueue[0]
      state.alertsQueue = state.alertsQueue.slice(1)
      state.isAlertVisible = true
    },
    openDeleteUserConfirmDialog: (state, action) => {
      state.isDeleteUserConfirmDialogOpen = true
      state.deleteUserConfirmDialogId = action.payload
    },
    closeDeleteUserConfirmDialog: (state) => {
      state.isDeleteUserConfirmDialogOpen = false
      state.deleteUserConfirmDialogId = undefined
    },
    clearWeatherApiError: (state) => {
      state.isWeatherApiKeyError = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.rows = action.payload.content
        state.allRowsCount = action.payload.pageMetadata.totalElements
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.isLoading = false
      })
      .addCase(deleteUser.pending, (state, action) => {
        state.pendingRows[action.meta.arg] = PendingRowReason.Delete
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        removeFromPendingRows(state, action.meta.arg)
        state.alertsQueue = [...state.alertsQueue, { key: new Date().getTime(), message: 'Pomyślnie usunięto użytkownika', severity: 'success' }]
      })
      .addCase(deleteUser.rejected, (state, action) => {
        removeFromPendingRows(state, action.meta.arg)
        state.alertsQueue = [...state.alertsQueue, { key: new Date().getTime(), message: 'Nie udało się usunąć użytkownika', severity: 'error' }]
      })
      .addCase(fetchWeatherApiKey.pending, (state) => {
        state.isLoadingWeatherApiKey = true
      })
      .addCase(fetchWeatherApiKey.fulfilled, (state) => {
        state.isLoadingWeatherApiKey = false
      })
      .addCase(fetchWeatherApiKey.rejected, (state) => {
        state.isLoadingWeatherApiKey = false
      })
      .addCase(setWeatherApiKey.pending, (state) => {
        state.isLoadingWeatherApiKey = true
        state.isWeatherApiKeyError = false
      })
      .addCase(setWeatherApiKey.fulfilled, (state, action) => {
        state.isLoadingWeatherApiKey = false
        state.weatherApiKey = action.meta.arg
        state.alertsQueue = [...state.alertsQueue, { key: new Date().getTime(), message: 'Pomyślnie ustawiono klucz API', severity: 'success' }]
      })
      .addCase(setWeatherApiKey.rejected, (state) => {
        state.isLoadingWeatherApiKey = false
        state.isWeatherApiKeyError = true
        state.alertsQueue = [...state.alertsQueue, { key: new Date().getTime(), message: 'Nie udało się ustawić klucza API', severity: 'error' }]
      })
  }
})

const removeFromPendingRows = (state: AdminPanelState, id: GridRowId): void => {
  const { [id]: _, ...pendingRows } = state.pendingRows
  state.pendingRows = pendingRows
}

export const {
  reset,
  clearAlert,
  clearAlertProps,
  updateAlert,
  openDeleteUserConfirmDialog,
  closeDeleteUserConfirmDialog,
  clearWeatherApiError
} = adminPanelSlice.actions
export const selectRows = (state: RootState): GridValidRowModel[] => state.adminPanel.rows
export const selectAllRowsCount = (state: RootState): number => state.adminPanel.allRowsCount
export const selectPendingRows = (state: RootState): PendingRows => state.adminPanel.pendingRows
export const selectIsLoading = (state: RootState): boolean => state.adminPanel.isLoading
export const selectIsAlertVisible = (state: RootState): boolean => state.adminPanel.isAlertVisible
export const selectAlertsQueue = (state: RootState): readonly AlertProps[] => state.adminPanel.alertsQueue
export const selectAlertProps = (state: RootState): AlertProps | undefined => state.adminPanel.alertProps
export const selectIsDeleteUserConfirmDialogOpen = (state: RootState): boolean => state.adminPanel.isDeleteUserConfirmDialogOpen
export const selectDeleteUserConfirmDialogId = (state: RootState): GridRowId | undefined => state.adminPanel.deleteUserConfirmDialogId
export const selectIsLoadingWeatherApiKey = (state: RootState): boolean => state.adminPanel.isLoadingWeatherApiKey
export const selectIsWeatherApiKeyError = (state: RootState): boolean => state.adminPanel.isWeatherApiKeyError
export const selectWeatherApiKey = (state: RootState): string => state.adminPanel.weatherApiKey
export default adminPanelSlice.reducer
