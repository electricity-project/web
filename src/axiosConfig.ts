import axios from 'axios'

import { logout } from './redux/slices/userAuthSlice'
import store from './redux/store'

const instance = axios.create({
  // eslint-disable-next-line
  baseURL: (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8084') + '/api',
  headers: {
    'Content-type': 'application/json'
  },
  timeout: 10000
})
instance.interceptors.request.use((config) => {
  if (store.getState().userAuth.token !== undefined) {
    config.headers.Authorization = 'Bearer ' + store.getState().userAuth.token
  }
  return config
})

instance.interceptors.response.use((response) => response,
  async error => {
    if ((error.response.status === 401 || error.response.status === 403) && store.getState().userAuth.token !== undefined) {
      console.error(`${error.response.status === 401 ? 'Unauthorized' : 'Forbidden'}! You will be log out`)
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!error.request.responseURL.endsWith('/api/login/logout')) {
        await store.dispatch(logout())
      }
    }
    throw error
  })

export default instance
