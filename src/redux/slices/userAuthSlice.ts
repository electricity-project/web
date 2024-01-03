import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import axios from '../../axiosConfig'
import { type UserRole } from '../../components/common/types'
import { type RootState } from '../store'

const LOCAL_STORAGE_AUTH_KEY = 'authToken'
const LOCAL_STORAGE_USER_DATA_KEY = 'userData'

const token = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY) ?? undefined
const stringUserData = localStorage.getItem(LOCAL_STORAGE_USER_DATA_KEY)
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

interface UserProps {
  username: string
  role: UserRole
}

interface UserAuthState {
  user: UserProps | undefined
  token: string | undefined
  isLoginPending: boolean
  isLoginError: boolean
}

const initialState: UserAuthState = {
  user: userData,
  token,
  isLoginPending: false,
  isLoginError: false
}

const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserInfo.pending, (state) => {
        state.isLoginPending = true
      })
      .addCase(getUserInfo.fulfilled, (state, action) => {
        state.isLoginPending = false
        const userData = { username: action.payload.username, role: action.payload.role }
        window.localStorage.setItem(LOCAL_STORAGE_USER_DATA_KEY, JSON.stringify(userData))
        state.user = userData
      })
      .addCase(getUserInfo.rejected, (state) => {
        state.isLoginPending = false
        window.localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
        window.localStorage.removeItem(LOCAL_STORAGE_USER_DATA_KEY)
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
        window.localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, action.payload.token)
        const userData = { username: action.payload.username, role: action.payload.role }
        window.localStorage.setItem(LOCAL_STORAGE_USER_DATA_KEY, JSON.stringify(userData))
        state.user = userData
      })
      .addCase(login.rejected, (state) => {
        state.isLoginPending = false
        state.isLoginError = true
      })
      .addCase(logout.pending, (state) => {
        window.localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
        window.localStorage.removeItem(LOCAL_STORAGE_USER_DATA_KEY)
        state.token = undefined
        state.user = undefined
      })
  }
})

export const selectIsLoginPending = (state: RootState): boolean => state.userAuth.isLoginPending
export const selectToken = (state: RootState): string | undefined => state.userAuth.token
export const selectUser = (state: RootState): UserProps | undefined => state.userAuth.user
export default userAuthSlice.reducer
