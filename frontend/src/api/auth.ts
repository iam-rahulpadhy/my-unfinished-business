import apiClient from './apiClient'
import type { AuthRequest, AuthResponse } from '../types'

export interface ResetPasswordRequest {
  username: string
  resetKey: string
  newPassword: string
}

export const authApi = {
  login: async (credentials: AuthRequest) => {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials)
    return res.data
  },
  register: async (data: AuthRequest & { email: string, displayName?: string }) => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data)
    return res.data
  },
  requestPasswordReset: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email })
    return res.data
  },
  resetPassword: async (data: { token: string; newPassword: string }) => {
    const res = await apiClient.post('/auth/reset-password', data)
    return res.data
  },
  updateProfile: async (data: { displayName?: string, bio?: string, captureButtonName?: string, customDisciplines?: string }): Promise<AuthResponse> => {
    const res = await apiClient.put<AuthResponse>('/auth/profile', data)
    return res.data
  },
  updateAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data
  },
}
