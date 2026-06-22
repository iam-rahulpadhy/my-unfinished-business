import { useQuery } from '@tanstack/react-query'
import { stockApi } from '../api/stock'
import { ledgerApi } from '../api/ledger'

export function useStockSummary() {
  return useQuery({
    queryKey: ['stock', 'summary'],
    queryFn: stockApi.getSummary,
    refetchInterval: 60_000, // refresh every minute
  })
}

export function useChartData(range: '1W' | '1M' | 'ALL') {
  return useQuery({
    queryKey: ['stock', 'chart', range],
    queryFn: () => stockApi.getChartData(range),
  })
}

export function useLedger() {
  return useQuery({
    queryKey: ['ledger'],
    queryFn: ledgerApi.getAll,
  })
}
