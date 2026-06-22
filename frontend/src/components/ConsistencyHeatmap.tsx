import { useMemo, useState } from 'react'
import { format, subDays, startOfDay, getDay, getYear, getMonth, parseISO, endOfYear, startOfYear, differenceInDays } from 'date-fns'
import type { DailyLedger } from '../types'
import { Info } from 'lucide-react'

interface ConsistencyHeatmapProps {
  entries: DailyLedger[] | undefined
}

interface HeatmapCell {
  date: Date
  entry?: DailyLedger
  intensity?: number
  isPadding: boolean
}

export default function ConsistencyHeatmap({ entries }: ConsistencyHeatmapProps) {
  const [selectedYear, setSelectedYear] = useState<number | 'Past Year'>('Past Year')

  const { availableYears, monthBlocks, totalActiveDays, maxStreak, totalEntries } = useMemo(() => {
    const today = startOfDay(new Date())
    
    // Find all available years from entries
    const yearsSet = new Set<number>()
    yearsSet.add(getYear(today))
    if (entries) {
      entries.forEach(e => yearsSet.add(getYear(parseISO(e.entryDate))))
    }
    const availableYears = Array.from(yearsSet).sort((a, b) => b - a)

    let startDate: Date
    let endDate: Date
    let days: number

    if (selectedYear === 'Past Year') {
      endDate = today
      days = 365
      startDate = subDays(endDate, days - 1)
    } else {
      startDate = startOfYear(new Date(selectedYear, 0, 1))
      endDate = endOfYear(new Date(selectedYear, 11, 31))
      // if the selected year is the current year, don't show future days, just end at today?
      // LeetCode shows the whole year, but future days are empty. We'll generate the full year.
      days = differenceInDays(endDate, startDate) + 1
    }

    
    // Create a map of date string -> entry
    const entryMap = new Map<string, DailyLedger>()
    let localMax = 0
    if (entries) {
      entries.forEach(e => {
        entryMap.set(e.entryDate, e)
        if (e.closingPrice > localMax) localMax = e.closingPrice
      })
    }

    // Group days by Month-Year
    const monthsMap = new Map<string, {
      label: string
      year: number
      month: number
      days: HeatmapCell[]
    }>()

    let currentStreak = 0
    let maxStreakCalc = 0
    let totalActiveDaysCalc = 0

    // Iterate from oldest to newest
    for (let i = 0; i < days; i++) {
      const d = selectedYear === 'Past Year' 
        ? subDays(endDate, days - 1 - i)
        : new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)

      const dateStr = format(d, 'yyyy-MM-dd')
      const entry = entryMap.get(dateStr)
      
      let intensity = 0
      if (entry) {
        intensity = localMax > 0 ? (entry.closingPrice / localMax) : 1
        if (intensity < 0.25) intensity = 0.25 // minimum visible intensity
        
        currentStreak++
        maxStreakCalc = Math.max(maxStreakCalc, currentStreak)
        totalActiveDaysCalc++
      } else {
        currentStreak = 0
      }

      const key = `${getYear(d)}-${getMonth(d)}`
      if (!monthsMap.has(key)) {
        monthsMap.set(key, {
          label: format(d, 'MMM'),
          year: getYear(d),
          month: getMonth(d),
          days: []
        })
      }

      monthsMap.get(key)!.days.push({ date: d, entry, intensity, isPadding: false })
    }

    // Format each month into columns (weeks)
    const blocks = Array.from(monthsMap.values()).map(monthData => {
      const firstDayOfWeek = getDay(monthData.days[0].date)
      const cols: HeatmapCell[][] = []
      let currentCol: HeatmapCell[] = Array(7).fill({ date: new Date(0), isPadding: true })
      
      let currentDayOfWeek = firstDayOfWeek
      
      monthData.days.forEach(day => {
        currentCol[currentDayOfWeek] = day
        currentDayOfWeek++
        if (currentDayOfWeek > 6) {
          cols.push(currentCol)
          currentCol = Array(7).fill({ date: new Date(0), isPadding: true })
          currentDayOfWeek = 0
        }
      })
      
      if (currentDayOfWeek > 0) {
        cols.push(currentCol)
      }
      
      return {
        ...monthData,
        cols
      }
    })
    
    // Total entries logic: if 'Past Year', count last 365. If specific year, count entries in that year.
    let yearEntriesCount = 0
    if (entries) {
      if (selectedYear === 'Past Year') {
        const oneYearAgoStr = format(startDate, 'yyyy-MM-dd')
        yearEntriesCount = entries.filter(e => e.entryDate >= oneYearAgoStr).length
      } else {
        yearEntriesCount = entries.filter(e => getYear(parseISO(e.entryDate)) === selectedYear).length
      }
    }

    return { 
      availableYears,
      monthBlocks: blocks,
      totalActiveDays: totalActiveDaysCalc,
      maxStreak: maxStreakCalc,
      totalEntries: yearEntriesCount
    }
  }, [entries, selectedYear])

  return (
    <div className="w-full h-full flex flex-col pt-2">
      {/* Top Stats Header & Year Filter */}
      <div className="mb-8 flex flex-col gap-2 px-2 relative">
        {/* Year Filter (Top Right) */}
        <div className="absolute right-2 top-0 flex flex-wrap gap-2 justify-end max-w-[200px]">
          <button
            onClick={() => setSelectedYear('Past Year')}
            className={`px-3 py-1 text-xs font-mono rounded-full transition-all ${
              selectedYear === 'Past Year' 
                ? 'bg-text-primary text-bg-base font-bold' 
                : 'bg-bg-surface text-text-muted hover:text-text-primary border border-bg-border'
            }`}
          >
            Past Year
          </button>
          {availableYears.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 text-xs font-mono rounded-full transition-all ${
                selectedYear === year 
                  ? 'bg-text-primary text-bg-base font-bold' 
                  : 'bg-bg-surface text-text-muted hover:text-text-primary border border-bg-border'
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-text-primary">{totalEntries}</span>
          <span className="text-text-secondary text-[16px] font-medium tracking-wide">
            {selectedYear === 'Past Year' ? 'submissions in the past year' : `submissions in ${selectedYear}`}
          </span>
          <span title="Filtered entries based on current tag selection">
            <Info size={15} className="text-text-muted cursor-pointer hover:text-text-primary transition-colors ml-1" />
          </span>
        </div>
        <div className="flex items-center gap-6 text-[13px] text-text-secondary">
          <span>Total active days: <span className="font-bold text-text-primary">{totalActiveDays}</span></span>
          <span>Max streak: <span className="font-bold text-text-primary">{maxStreak}</span></span>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar flex">
        <div className="flex min-w-max pb-6 px-2 gap-2">
          
          {/* Row labels (Mon, Wed, Fri) */}
          <div className="flex flex-col gap-[3px] pt-0">
            <div className="h-[11px] w-6"></div>
            <div className="h-[11px] w-6 text-[10px] leading-[11px] font-mono text-text-muted flex items-center justify-end pr-2">Mon</div>
            <div className="h-[11px] w-6"></div>
            <div className="h-[11px] w-6 text-[10px] leading-[11px] font-mono text-text-muted flex items-center justify-end pr-2">Wed</div>
            <div className="h-[11px] w-6"></div>
            <div className="h-[11px] w-6 text-[10px] leading-[11px] font-mono text-text-muted flex items-center justify-end pr-2">Fri</div>
            <div className="h-[11px] w-6"></div>
          </div>

          {/* Month Blocks */}
          <div className="flex gap-4">
            {monthBlocks.map((block, bIdx) => (
              <div key={bIdx} className="flex flex-col">
                <div className="flex gap-[3px]">
                  {block.cols.map((col, cIdx) => (
                    <div key={cIdx} className="flex flex-col gap-[3px]">
                      {col.map((cell, rIdx) => (
                        <div
                          key={rIdx}
                          title={cell.isPadding ? undefined : `${format(cell.date, 'MMM dd, yyyy')}${cell.entry ? ` - Score: ${cell.entry.closingPrice}` : ' - No entry'}`}
                          className={`w-[11px] h-[11px] rounded-[2px] transition-all duration-200 ${
                            cell.isPadding ? 'opacity-0 pointer-events-none' :
                            cell.entry 
                              ? 'bg-text-primary hover:ring-1 ring-text-primary/60 cursor-pointer shadow-sm' 
                              : 'bg-text-primary/5 hover:bg-text-primary/10 cursor-pointer'
                          }`}
                          style={cell.entry ? { opacity: Math.max(0.3, cell.intensity!) } : {}}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-text-muted mt-2 text-center font-sans tracking-wide">
                  {block.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
