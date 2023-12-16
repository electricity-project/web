import axios from 'axios'

export default axios.create({
  // eslint-disable-next-line
  baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:8080/',
  headers: {
    'Content-type': 'application/json'
  }
})
