import axios from 'axios'

import { logout } from './redux/slices/userAuthSlice'
import store from './redux/store'

const instance = axios.create({
  // eslint-disable-next-line
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/',
  headers: {
    'Content-type': 'application/json'
  },
  timeout: 10000
})
instance.interceptors.request.use((config) => {
  config.headers.Authorization = store.getState().userAuth.token
  return config
})

instance.interceptors.response.use((response) => response,
  async error => {
    if (error.response.status === 401 || error.response.status === 403) {
      console.error(`${error.response.status === 401 ? 'Unauthorized' : 'Forbidden'}! You will be log out`)
      await store.dispatch(logout())
    }
    return error
  })

export default instance
