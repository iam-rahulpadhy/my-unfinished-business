import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  username: string | null
  displayName: string | null
  bio: string | null
  captureButtonName: string | null
  customDisciplines: string | null
  role: string | null
  setAuth: (token: string, username: string, displayName: string | null, bio: string | null, captureButtonName: string | null, customDisciplines: string | null, role: string) => void
  updateProfile: (data: { displayName?: string | null, bio?: string | null, captureButtonName?: string | null, customDisciplines?: string | null }) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      displayName: null,
      bio: null,
      captureButtonName: null,
      customDisciplines: null,
      role: null,
      setAuth: (token, username, displayName, bio, captureButtonName, customDisciplines, role) => set({ token, username, displayName, bio, captureButtonName, customDisciplines, role }),
      updateProfile: (data) => set((state) => ({ ...state, ...data })),
      clearAuth: () => set({ token: null, username: null, displayName: null, bio: null, captureButtonName: null, customDisciplines: null, role: null }),
    }),
    {
      name: 'mub-auth',   // localStorage key
    }
  )
)
