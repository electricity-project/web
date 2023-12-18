import axios from 'axios'

export default axios.create({
  // eslint-disable-next-line
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/',
  headers: {
    'Content-type': 'application/json'
  }
})
