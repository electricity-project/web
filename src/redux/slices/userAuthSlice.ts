import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'

import axios from '../../axiosConfig'
import { UserRole } from '../../components/common/types'
import { type RootState } from '../store'

const calculateTokenExpirationTime = (actualTokenExpirationTime: number): number => {
  return Math.max(actualTokenExpirationTime - 10, 1) * 1000
}

const SESSION_STORAGE_TOKEN_KEY = 'authToken'
const SESSION_STORAGE_TOKEN_EXPIRATION_TIME_KEY = 'authTokenExpirationTime'
const SESSION_STORAGE_REFRESH_TOKEN_KEY = 'authRefreshToken'
const SESSION_STORAGE_USER_DATA_KEY = 'userData'

const token = sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY) ?? undefined
const stringTokenExpirationTime = sessionStorage.getItem(SESSION_STORAGE_TOKEN_EXPIRATION_TIME_KEY)
const tokenExpirationTime = stringTokenExpirationTime === null ? undefined : calculateTokenExpirationTime(Number(stringTokenExpirationTime))
const refreshToken = sessionStorage.getItem(SESSION_STORAGE_REFRESH_TOKEN_KEY) ?? undefined
const stringUserData = sessionStorage.getItem(SESSION_STORAGE_USER_DATA_KEY)
const userData: UserProps | undefined = stringUserData === null ? undefined : JSON.parse(stringUserData)

interface UserInfoResult {
  username: string
  role: UserRole
}

export const getUserInfo = createAsyncThunk<UserInfoResult>(
  'userAuth/getUserInfo',
  async (_, { rejectWithValue }) => {
    return await axios.get('/user/info/me')
      .then(response => {
        const role = findRole(response.data.roles.map((role: any) => role.name))
        if (role === undefined) {
          return rejectWithValue(response)
        }
        return { username: response.data.username, role }
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

export const findRole = (roles: string[]): UserRole | undefined => {
  let role
  if (roles.includes(UserRole.UserChangePassword)) {
    role = UserRole.UserChangePassword
  } else if (roles.includes(UserRole.Admin)) {
    role = UserRole.Admin
  } else if (roles.includes(UserRole.User)) {
    role = UserRole.User
  }
  return role
}

interface LoginProps {
  username: string
  password: string
}

interface LoginResult {
  username: string
  token: string
  tokenExpirationTime: number
  refreshToken: string
  role: UserRole
}

interface RealmAccess {
  roles: string[]
}

interface JwtPayload {
  realm_access: RealmAccess
}

export const login = createAsyncThunk<LoginResult, LoginProps>(
  'userAuth/login',
  async (props, { rejectWithValue }) => {
    return await axios.post('/login', props)
      .then(response => {
        const token = response.data.access_token
        const tokenExpirationTime = response.data.expires_in
        const decodedToken = jwtDecode<JwtPayload>(token)
        const roles = decodedToken.realm_access.roles
        const role = findRole(roles)
        if (role === undefined) {
          return rejectWithValue(response)
        }
        const refreshToken = response.data.refresh_token
        return { username: props.username, role, token, tokenExpirationTime, refreshToken }
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

export const logout = createAsyncThunk(
  'userAuth/logout',
  async (_, { rejectWithValue }) => {
    return await axios.get('/login/logout')
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
    return await axios.post('/user/my-password', undefined, { params: { password: newPassword } })
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

interface RefreshTokenResult {
  token: string
  tokenExpirationTime: number
  refreshToken: string
}

export const refreshAuthTokens = createAsyncThunk<RefreshTokenResult>(
  'userAuth/refreshAuthTokens',
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as RootState
    return await axios.post('/login/refresh-token', undefined, { params: { token: state.userAuth.refreshToken } })
      .then(response => {
        return {
          token: response.data.access_token,
          tokenExpirationTime: response.data.expires_in,
          refreshToken: response.data.refresh_token
        }
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
  tokenExpirationTime: number | undefined
  refreshToken: string | undefined
  isLoginPending: boolean
  isLoginError: boolean
  isPasswordChangePending: boolean
  isPasswordChangeError: boolean
}

const initialState: UserAuthState = {
  user: userData,
  token,
  tokenExpirationTime,
  refreshToken,
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
        window.sessionStorage.removeItem(SESSION_STORAGE_TOKEN_KEY)
        window.sessionStorage.removeItem(SESSION_STORAGE_TOKEN_EXPIRATION_TIME_KEY)
        window.sessionStorage.removeItem(SESSION_STORAGE_REFRESH_TOKEN_KEY)
        window.sessionStorage.removeItem(SESSION_STORAGE_USER_DATA_KEY)
        state.token = undefined
        state.tokenExpirationTime = undefined
        state.refreshToken = undefined
        state.user = undefined
      })
      .addCase(login.pending, (state) => {
        state.isLoginPending = true
        state.isLoginError = false
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoginPending = false
        state.token = action.payload.token
        const tokenExpirationTime = calculateTokenExpirationTime(action.payload.tokenExpirationTime)
        state.tokenExpirationTime = tokenExpirationTime
        state.refreshToken = action.payload.refreshToken
        window.sessionStorage.setItem(SESSION_STORAGE_TOKEN_KEY, action.payload.token)
        window.sessionStorage.setItem(SESSION_STORAGE_TOKEN_EXPIRATION_TIME_KEY, String(tokenExpirationTime))
        window.sessionStorage.setItem(SESSION_STORAGE_REFRESH_TOKEN_KEY, action.payload.refreshToken)
        const userData = { username: action.payload.username, role: action.payload.role }
        window.sessionStorage.setItem(SESSION_STORAGE_USER_DATA_KEY, JSON.stringify(userData))
        state.user = userData
      })
      .addCase(login.rejected, (state) => {
        state.isLoginPending = false
        state.isLoginError = true
      })
      .addCase(logout.fulfilled, (state) => {
        window.sessionStorage.removeItem(SESSION_STORAGE_TOKEN_KEY)
        window.sessionStorage.removeItem(SESSION_STORAGE_TOKEN_EXPIRATION_TIME_KEY)
        window.sessionStorage.removeItem(SESSION_STORAGE_REFRESH_TOKEN_KEY)
        window.sessionStorage.removeItem(SESSION_STORAGE_USER_DATA_KEY)
        state.token = undefined
        state.tokenExpirationTime = undefined
        state.refreshToken = undefined
        state.user = undefined
      })
      .addCase(logout.rejected, (state) => {
        window.sessionStorage.removeItem(SESSION_STORAGE_TOKEN_KEY)
        window.sessionStorage.removeItem(SESSION_STORAGE_TOKEN_EXPIRATION_TIME_KEY)
        window.sessionStorage.removeItem(SESSION_STORAGE_REFRESH_TOKEN_KEY)
        window.sessionStorage.removeItem(SESSION_STORAGE_USER_DATA_KEY)
        state.token = undefined
        state.tokenExpirationTime = undefined
        state.refreshToken = undefined
        state.user = undefined
      })
      .addCase(changePassword.pending, (state) => {
        state.isPasswordChangePending = true
        state.isPasswordChangeError = false
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isPasswordChangePending = false
        state.token = action.payload.token
        const tokenExpirationTime = calculateTokenExpirationTime(action.payload.tokenExpirationTime)
        state.tokenExpirationTime = tokenExpirationTime
        state.refreshToken = action.payload.refreshToken
        window.sessionStorage.setItem(SESSION_STORAGE_TOKEN_KEY, action.payload.token)
        window.sessionStorage.setItem(SESSION_STORAGE_TOKEN_EXPIRATION_TIME_KEY, String(tokenExpirationTime))
        window.sessionStorage.setItem(SESSION_STORAGE_REFRESH_TOKEN_KEY, action.payload.refreshToken)
        const userData = { username: action.payload.username, role: action.payload.role }
        window.sessionStorage.setItem(SESSION_STORAGE_USER_DATA_KEY, JSON.stringify(userData))
        state.user = userData
      })
      .addCase(changePassword.rejected, (state) => {
        state.isPasswordChangePending = false
        state.isPasswordChangeError = true
      })
      .addCase(refreshAuthTokens.fulfilled, (state, action) => {
        state.token = action.payload.token
        const tokenExpirationTime = calculateTokenExpirationTime(action.payload.tokenExpirationTime)
        state.tokenExpirationTime = tokenExpirationTime
        state.refreshToken = action.payload.refreshToken
        window.sessionStorage.setItem(SESSION_STORAGE_TOKEN_KEY, action.payload.token)
        window.sessionStorage.setItem(SESSION_STORAGE_TOKEN_EXPIRATION_TIME_KEY, String(tokenExpirationTime))
        window.sessionStorage.setItem(SESSION_STORAGE_REFRESH_TOKEN_KEY, action.payload.refreshToken)
      })
      .addCase(refreshAuthTokens.rejected, (state) => {
        window.sessionStorage.removeItem(SESSION_STORAGE_TOKEN_KEY)
        window.sessionStorage.removeItem(SESSION_STORAGE_REFRESH_TOKEN_KEY)
        window.sessionStorage.removeItem(SESSION_STORAGE_USER_DATA_KEY)
        state.token = undefined
        state.tokenExpirationTime = undefined
        state.refreshToken = undefined
        state.user = undefined
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
export const selectTokenExpirationTime = (state: RootState): number | undefined => state.userAuth.tokenExpirationTime
export const selectUser = (state: RootState): UserProps | undefined => state.userAuth.user
export default userAuthSlice.reducer
