import apiClient from './apiClient'
import type { DailyLedger, DailyLedgerRequest } from '../types'

export const ledgerApi = {
  getAll: async (): Promise<DailyLedger[]> => {
    const res = await apiClient.get<DailyLedger[]>('/ledger')
    return res.data
  },

  getById: async (id: string): Promise<DailyLedger> => {
    const res = await apiClient.get<DailyLedger>(`/ledger/${id}`)
    return res.data
  },

  create: async (data: DailyLedgerRequest): Promise<DailyLedger> => {
    const res = await apiClient.post<DailyLedger>('/ledger', data)
    return res.data
  },

  update: async (id: string, data: DailyLedgerRequest): Promise<DailyLedger> => {
    const res = await apiClient.put<DailyLedger>(`/ledger/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/ledger/${id}`)
  },
}
