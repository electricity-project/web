import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import axios from '../../axiosConfig'
import { type UserRole } from '../../components/common/types'
import { type RootState } from '../store'

const SESSION_STORAGE_AUTH_KEY = 'authToken'
const SESSION_STORAGE_USER_DATA_KEY = 'userData'

const token = sessionStorage.getItem(SESSION_STORAGE_AUTH_KEY) ?? undefined
const stringUserData = sessionStorage.getItem(SESSION_STORAGE_USER_DATA_KEY)
const userData: UserProps | undefined = stringUserData === null ? undefined : JSON.parse(stringUserData)

export const getUserInfo = createAsyncThunk(
  'userAuth/getUserInfo',
  async (_, { rejectWithValue }) => {
    return await axios.get('/user/info')
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

interface LoginProps {
  username: string
  password: string
}

export const login = createAsyncThunk(
  'userAuth/login',
  async (props: LoginProps, { rejectWithValue }) => {
    return await axios.post('/auth/login', props)
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

export const logout = createAsyncThunk(
  'userAuth/logout',
  async (_, { rejectWithValue }) => {
    return await axios.get('/auth/logout')
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

export const changePassword = createAsyncThunk(
  'userAuth/changePassword',
  async (newPassword: string, { rejectWithValue }) => {
    return await axios.post('/auth/password', { newPassword })
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

interface UserProps {
  username: string
  role: UserRole
}

interface UserAuthState {
  user: UserProps | undefined
  token: string | undefined
  isLoginPending: boolean
  isLoginError: boolean
  isPasswordChangePending: boolean
  isPasswordChangeError: boolean
}

const initialState: UserAuthState = {
  user: userData,
  token,
  isLoginPending: false,
  isLoginError: false,
  isPasswordChangePending: false,
  isPasswordChangeError: false
}

const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState,
  reducers: {
    clearLoginError: (state) => {
      state.isLoginError = false
    },
    clearPasswordChangeError: (state) => {
      state.isPasswordChangeError = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserInfo.pending, (state) => {
        state.isLoginPending = true
      })
      .addCase(getUserInfo.fulfilled, (state, action) => {
        state.isLoginPending = false
        const userData = { username: action.payload.username, role: action.payload.role }
        window.sessionStorage.setItem(SESSION_STORAGE_USER_DATA_KEY, JSON.stringify(userData))
        state.user = userData
      })
      .addCase(getUserInfo.rejected, (state) => {
        state.isLoginPending = false
        window.sessionStorage.removeItem(SESSION_STORAGE_AUTH_KEY)
        window.sessionStorage.removeItem(SESSION_STORAGE_USER_DATA_KEY)
        state.token = undefined
        state.user = undefined
      })
      .addCase(login.pending, (state) => {
        state.isLoginPending = true
        state.isLoginError = false
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoginPending = false
        state.token = action.payload.token
        window.sessionStorage.setItem(SESSION_STORAGE_AUTH_KEY, action.payload.token)
        const userData = { username: action.payload.username, role: action.payload.role }
        window.sessionStorage.setItem(SESSION_STORAGE_USER_DATA_KEY, JSON.stringify(userData))
        state.user = userData
      })
      .addCase(login.rejected, (state) => {
        state.isLoginPending = false
        state.isLoginError = true
      })
      .addCase(logout.pending, (state) => {
        window.sessionStorage.removeItem(SESSION_STORAGE_AUTH_KEY)
        window.sessionStorage.removeItem(SESSION_STORAGE_USER_DATA_KEY)
        state.token = undefined
        state.user = undefined
      })
      .addCase(changePassword.pending, (state) => {
        state.isPasswordChangePending = true
        state.isPasswordChangeError = false
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isPasswordChangePending = false
        state.token = action.payload.token
        window.sessionStorage.setItem(SESSION_STORAGE_AUTH_KEY, action.payload.token)
        const userData = { username: action.payload.username, role: action.payload.role }
        window.sessionStorage.setItem(SESSION_STORAGE_USER_DATA_KEY, JSON.stringify(userData))
        state.user = userData
      })
      .addCase(changePassword.rejected, (state) => {
        state.isPasswordChangePending = false
        state.isPasswordChangeError = true
      })
  }
})

export const {
  clearLoginError,
  clearPasswordChangeError
} = userAuthSlice.actions

export const selectIsLoginPending = (state: RootState): boolean => state.userAuth.isLoginPending
export const selectIsLoginError = (state: RootState): boolean => state.userAuth.isLoginError
export const selectIsPasswordChangePending = (state: RootState): boolean => state.userAuth.isPasswordChangePending
export const selectIsPasswordChangeError = (state: RootState): boolean => state.userAuth.isPasswordChangeError
export const selectToken = (state: RootState): string | undefined => state.userAuth.token
export const selectUser = (state: RootState): UserProps | undefined => state.userAuth.user
export default userAuthSlice.reducer
