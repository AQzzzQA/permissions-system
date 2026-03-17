import axios from 'axios'
import { getToken } from '../utils/auth'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://43.156.131.98:8001/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    })

    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default request
