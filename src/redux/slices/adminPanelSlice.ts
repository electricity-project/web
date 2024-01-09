import { type AlertColor } from '@mui/material'
import type { GridPaginationModel, GridRowId, GridSortItem, GridValidRowModel } from '@mui/x-data-grid'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import axios from '../../axiosConfig'
import { UserRole } from '../../components/common/types'
import { type RootState } from '../store'

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
    return await axios.get('/user', { params })
      .then(response => {
        return { ...response.data, content: mapUsers(response.data.content) }
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

const mapUsers = (users: any[]): any[] => {
  return users.map((user: any) => {
    return { ...user, role: findRole(user.roles.map((role: any) => role.name)) ?? UserRole.User }
  })
}

export const findRole = (roles: string[]): UserRole | undefined => {
  let role
  if (roles.includes(UserRole.Admin)) {
    role = UserRole.Admin
  } else if (roles.includes(UserRole.User)) {
    role = UserRole.User
  }
  return role
}

export const createUser = createAsyncThunk(
  'adminPanel/createUser',
  async (props: UserProps, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return await axios.post('/user', props)
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

interface UserUpdateProps {
  id: GridRowId
  newValue: UserProps
}

export const updateUser = createAsyncThunk(
  'adminPanel/updateUser',
  async (props: UserUpdateProps, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return await axios.put('/user/update', props.newValue, { params: { userId: props.id } })
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
  async (userId: GridRowId, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return await axios.delete('/user/delete', { params: { userId } })
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

export const validateUsername = createAsyncThunk(
  'adminPanel/validateUsername',
  async (username: string, { rejectWithValue }) => {
    if (username === '') {
      return
    }
    return await axios.post('/user/validate', undefined, { params: { username } })
      .then(response => {
        if (response.data === true) {
          return response.data
        }
        return rejectWithValue(response)
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

export const resetPassword = createAsyncThunk(
  'adminPanel/resetPassword',
  async (userId: GridRowId, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return await axios.post('/user/password', undefined, { params: { userId } })
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
    return await axios.get('/user/weather-api-key')
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
    return await axios.post('/user/weather-api-key', { weatherApiKey: newWeatherApiKey })
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

interface UserProps {
  username: string
  role: UserRole
}

interface EditedUserData {
  id: GridRowId
  userData: UserProps
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
  isCreateUserDialogOpen: boolean
  isUsernameValidationPending: boolean
  isUsernameValidationError: boolean
  isCreateUserPending: boolean
  isCreateUserError: boolean
  oneTimePassword: string | undefined
  editedUserData: EditedUserData | undefined
  isEditUserDialogOpen: boolean
  isEditUserPending: boolean
  isEditUserError: boolean
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
  weatherApiKey: '',
  isCreateUserDialogOpen: false,
  isUsernameValidationPending: false,
  isUsernameValidationError: false,
  isCreateUserPending: false,
  isCreateUserError: false,
  oneTimePassword: undefined,
  editedUserData: undefined,
  isEditUserDialogOpen: false,
  isEditUserPending: false,
  isEditUserError: false
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
    },
    openCreateUserDialog: (state) => {
      state.isUsernameValidationError = false
      state.isCreateUserError = false
      state.isCreateUserDialogOpen = true
      state.oneTimePassword = undefined
    },
    closeCreateUserDialog: (state) => {
      state.isCreateUserDialogOpen = false
    },
    clearOneTimePassword: (state) => {
      state.oneTimePassword = undefined
    },
    openEditUserDialog: (state, action) => {
      const rowIndex = state.rows.findIndex((row) => row.id === action.payload)
      if (rowIndex !== -1) {
        state.isEditUserError = false
        state.isUsernameValidationError = false
        state.oneTimePassword = undefined
        state.isEditUserDialogOpen = true
        state.editedUserData = { id: action.payload, userData: state.rows[rowIndex] as UserProps }
      }
    },
    closeEditUserDialog: (state) => {
      state.isEditUserDialogOpen = false
      state.editedUserData = undefined
      state.oneTimePassword = undefined
    },
    clearUsernameValidationError: (state) => {
      state.isUsernameValidationError = false
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
        state.allRowsCount = action.payload.totalElements
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.isLoading = false
      })
      .addCase(createUser.pending, (state) => {
        state.isCreateUserPending = true
        state.isCreateUserError = false
        state.oneTimePassword = undefined
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isCreateUserPending = false
        state.oneTimePassword = action.payload.password
      })
      .addCase(createUser.rejected, (state) => {
        state.isCreateUserPending = false
        state.isCreateUserError = true
      })
      .addCase(updateUser.pending, (state) => {
        state.isEditUserPending = true
        state.isEditUserError = false
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.isEditUserPending = false
      })
      .addCase(updateUser.rejected, (state) => {
        state.isEditUserPending = false
        state.isEditUserError = true
      })
      .addCase(deleteUser.pending, (state, action) => {
        state.pendingRows[action.meta.arg] = PendingRowReason.Delete
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        removeFromPendingRows(state, action.meta.arg)
        state.rows = state.rows.filter((row) => row.id !== action.meta.arg)
        state.alertsQueue = [...state.alertsQueue, { key: new Date().getTime(), message: 'Pomyślnie usunięto użytkownika', severity: 'success' }]
      })
      .addCase(deleteUser.rejected, (state, action) => {
        removeFromPendingRows(state, action.meta.arg)
        state.alertsQueue = [...state.alertsQueue, { key: new Date().getTime(), message: 'Nie udało się usunąć użytkownika', severity: 'error' }]
      })
      .addCase(validateUsername.pending, (state) => {
        state.isUsernameValidationPending = true
      })
      .addCase(validateUsername.fulfilled, (state) => {
        state.isUsernameValidationError = false
        state.isUsernameValidationPending = false
      })
      .addCase(validateUsername.rejected, (state) => {
        state.isUsernameValidationError = true
        state.isUsernameValidationPending = false
      })
      .addCase(resetPassword.pending, (state) => {
        state.isEditUserPending = true
        state.isEditUserError = false
        state.oneTimePassword = undefined
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isEditUserPending = false
        state.oneTimePassword = action.payload.password
      })
      .addCase(resetPassword.rejected, (state) => {
        state.isEditUserPending = false
        state.isEditUserError = true
      })
      .addCase(fetchWeatherApiKey.pending, (state) => {
        state.isLoadingWeatherApiKey = true
      })
      .addCase(fetchWeatherApiKey.fulfilled, (state, action) => {
        state.isLoadingWeatherApiKey = false
        state.weatherApiKey = action.payload.weatherApiKey
      })
      .addCase(fetchWeatherApiKey.rejected, (state) => {
        state.isLoadingWeatherApiKey = false
        state.weatherApiKey = ''
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
  clearWeatherApiError,
  openCreateUserDialog,
  closeCreateUserDialog,
  clearOneTimePassword,
  openEditUserDialog,
  closeEditUserDialog,
  clearUsernameValidationError
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
export const selectIsCreateUserDialogOpen = (state: RootState): boolean => state.adminPanel.isCreateUserDialogOpen
export const selectIsUsernameValidationPending = (state: RootState): boolean => state.adminPanel.isUsernameValidationPending
export const selectIsUsernameValidationError = (state: RootState): boolean => state.adminPanel.isUsernameValidationError
export const selectIsCreateUserPending = (state: RootState): boolean => state.adminPanel.isCreateUserPending
export const selectIsCreateUserError = (state: RootState): boolean => state.adminPanel.isCreateUserError
export const selectOneTimePassword = (state: RootState): string | undefined => state.adminPanel.oneTimePassword
export const selectEditedUserData = (state: RootState): EditedUserData | undefined => state.adminPanel.editedUserData
export const selectIsEditUserDialogOpen = (state: RootState): boolean => state.adminPanel.isEditUserDialogOpen
export const selectIsEditUserPending = (state: RootState): boolean => state.adminPanel.isEditUserPending
export const selectIsEditUserError = (state: RootState): boolean => state.adminPanel.isEditUserError
export default adminPanelSlice.reducer
