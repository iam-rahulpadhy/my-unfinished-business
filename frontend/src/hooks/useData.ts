import { useQuery } from '@tanstack/react-query'
import { stockApi } from '../api/stock'
import { ledgerApi } from '../api/ledger'
import { getMilestones } from '../api/milestones'

export function useStockSummary() {
  return useQuery({
    queryKey: ['stock', 'summary'],
    queryFn: stockApi.getSummary,
    refetchInterval: 60_000, // refresh every minute
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  })
}

export function useChartData(range: '1W' | '1M' | 'ALL') {
  return useQuery({
    queryKey: ['stock', 'chart', range],
    queryFn: () => stockApi.getChartData(range),
    staleTime: 5 * 60 * 1000,
  })
}

export function useLedger() {
  return useQuery({
    queryKey: ['ledger'],
    queryFn: ledgerApi.getAll,
    staleTime: 5 * 60 * 1000,
  })
}

export function useMilestones() {
  return useQuery({
    queryKey: ['milestones'],
    queryFn: getMilestones,
    staleTime: 5 * 60 * 1000,
  })
}
