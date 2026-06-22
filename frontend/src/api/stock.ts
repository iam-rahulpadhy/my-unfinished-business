import apiClient from './apiClient'
import type { DailyLedger, StockSummary } from '../types'

export const stockApi = {
  getSummary: async (): Promise<StockSummary> => {
    const res = await apiClient.get<StockSummary>('/stock/summary')
    return res.data
  },

  getChartData: async (range: '1W' | '1M' | 'ALL'): Promise<DailyLedger[]> => {
    const res = await apiClient.get<DailyLedger[]>(`/stock/chart?range=${range}`)
    return res.data
  },
}
