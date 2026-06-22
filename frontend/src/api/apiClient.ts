/// <reference types="vite/client" />
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const isProd = import.meta.env.PROD
export const API_BASE_URL = isProd 
  ? 'https://my-unfinished-business.onrender.com/api' 
  : (import.meta.env.VITE_API_URL || '/api')

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor: Attach JWT ──────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response Interceptor: Handle 401 ─────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<!doctype html>')) {
      console.error('API returned HTML instead of JSON. The backend is likely unreachable.')
      return Promise.reject(new Error('Backend unreachable'))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
