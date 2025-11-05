import axios from 'axios'
const api = axios.create({
  baseURL: 'http://localhost:3026/',
  // timeout: 2000,
  headers: {
    'Content-Type': 'application/json',
  },
})
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)
export default api
