export interface User {
  id: string
  username: string
  displayName?: string
  bio?: string
  captureButtonName?: string
  customDisciplines?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
}

export interface DailyLedger {
  id: string
  entryDate: string           // ISO date string, e.g. "2024-06-15"
  closingPrice: number
  percentageChange: number
  summaryText: string
  completedDisciplines: string // comma-separated
  tags?: string
  createdAt: string
}

export interface DailyLedgerRequest {
  entryDate: string
  closingPrice: number
  percentageChange?: number   // auto-calculated if omitted
  summaryText: string
  completedDisciplines: string // comma-separated
  tags?: string
}

export interface AuthRequest {
  username: string
  password: string
  displayName?: string
}

export interface AuthResponse {
  token: string
  username: string
  displayName?: string
  bio?: string
  captureButtonName?: string
  customDisciplines?: string
  role: string
}

export interface StockSummary {
  currentPrice: number
  dailyChange: number         // absolute change
  dailyChangePercent: number  // % change
  sevenDaySma: number | null
  allTimeHigh: number | null
  allTimeLow: number | null
  totalEntries: number
}

export interface ChartDataPoint {
  time: string   // YYYY-MM-DD
  value: number
}
