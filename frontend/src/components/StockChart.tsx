import { useEffect, useRef } from 'react'
import { createChart, ColorType, LineStyle, type IChartApi, type ISeriesApi, type LineData } from 'lightweight-charts'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { subWeeks, subMonths, parseISO } from 'date-fns'
import { useThemeStore } from '../store/themeStore'
import type { DailyLedger } from '../types'

type Range = '1W' | '1M' | 'ALL'

const RANGES: Range[] = ['1W', '1M', 'ALL']

interface StockChartProps {
  filteredEntries?: DailyLedger[]
  range: Range
  onRangeChange: (r: Range) => void
}

export default function StockChart({ filteredEntries, range, onRangeChange }: StockChartProps) {
  const data = (() => {
    if (!filteredEntries) return []
    const sorted = [...filteredEntries].sort((a, b) => a.entryDate.localeCompare(b.entryDate))
    if (range === 'ALL') return sorted
    const now = new Date()
    const cutoff = range === '1W' ? subWeeks(now, 1) : subMonths(now, 1)
    return sorted.filter(e => parseISO(e.entryDate) >= cutoff)
  })()

  const isLoading = !filteredEntries

  const theme = useThemeStore((s) => s.theme)
  const isDark = theme === 'dark'

  const chartRef = useRef<HTMLDivElement>(null)
  const chartApiRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)

  // ── Initialize Chart ────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartRef.current) return

    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDark ? '#A1A1AA' : '#71717A',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', style: LineStyle.Dotted },
        horzLines: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', style: LineStyle.Dotted },
      },
      crosshair: {
        vertLine: { color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', labelBackgroundColor: isDark ? '#1A1A1A' : '#E4E4E7' },
        horzLine: { color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', labelBackgroundColor: isDark ? '#1A1A1A' : '#E4E4E7' },
      },
      rightPriceScale: {
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        textColor: isDark ? '#A1A1AA' : '#71717A',
      },
      timeScale: {
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    })

    const series = chart.addAreaSeries({
      lineColor: isDark ? '#FAFAFA' : '#09090B',
      topColor: isDark ? 'rgba(250, 250, 250, 0.08)' : 'rgba(9, 9, 11, 0.08)',
      bottomColor: 'transparent',
      lineWidth: 2,
      crosshairMarkerBackgroundColor: isDark ? '#FAFAFA' : '#09090B',
      crosshairMarkerBorderColor: isDark ? '#050505' : '#FAFAFA',
      crosshairMarkerRadius: 5,
      priceLineColor: isDark ? 'rgba(250, 250, 250, 0.3)' : 'rgba(9, 9, 11, 0.3)',
      priceLineStyle: LineStyle.Dashed,
    })

    chartApiRef.current = chart
    seriesRef.current = series

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) {
        chart.applyOptions({ width: chartRef.current.clientWidth })
      }
    })
    resizeObserver.observe(chartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [])

  // ── Update data when range or data changes ──────────────────────────────
  useEffect(() => {
    if (!seriesRef.current || !data || data.length === 0) return

    const isBearish = data[data.length - 1].closingPrice < data[0].closingPrice
    
    let lineColor = isDark ? '#FAFAFA' : '#09090B' // Bull
    let topColor = isDark ? 'rgba(250, 250, 250, 0.08)' : 'rgba(9, 9, 11, 0.08)' // Bull

    if (isBearish) {
      lineColor = isDark ? '#52525B' : '#71717A'
      topColor = isDark ? 'rgba(82, 82, 91, 0.15)' : 'rgba(113, 113, 122, 0.15)'
    }

    seriesRef.current.applyOptions({
      lineColor,
      topColor,
      crosshairMarkerBackgroundColor: lineColor,
    })

    const chartData: LineData[] = data.map((d) => ({
      time: d.entryDate as unknown as LineData['time'],
      value: Number(d.closingPrice),
    }))

    seriesRef.current.setData(chartData)
    chartApiRef.current?.timeScale().fitContent()
  }, [data, isDark])

  // ── Update chart options when theme changes ──────────────────────────────
  useEffect(() => {
    if (!chartApiRef.current || !seriesRef.current) return

    chartApiRef.current.applyOptions({
      layout: { textColor: isDark ? '#A1A1AA' : '#71717A' },
      grid: {
        vertLines: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
        horzLines: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
      },
      crosshair: {
        vertLine: { color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', labelBackgroundColor: isDark ? '#1A1A1A' : '#E4E4E7' },
        horzLine: { color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', labelBackgroundColor: isDark ? '#1A1A1A' : '#E4E4E7' },
      },
      rightPriceScale: { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
      timeScale: { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
    })
    
    // We also re-trigger the data effect by having isDark in its dependency array
  }, [isDark])

  return (
    <motion.div
      className="flex flex-col w-full h-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Range Selector — compact, sits at top */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-muted text-xs font-mono uppercase tracking-wider">Growth Chart</span>
        <div className="flex items-center gap-1 bg-bg-surface border border-bg-border rounded-lg p-0.5">
          {RANGES.map((r) => (
            <motion.button
              key={r}
              onClick={() => onRangeChange(r)}
              className={clsx(
                'px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors',
                range === r
                  ? 'bg-bg-card text-text-primary border border-bg-border'
                  : 'text-text-muted hover:text-text-primary'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {r}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-bg-surface/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-accent-bull border-t-transparent rounded-full animate-spin" />
              <span className="text-text-muted text-xs font-mono">Loading chart data...</span>
            </div>
          </div>
        )}

        {!isLoading && data?.length === 0 && (
          <div className="flex items-center justify-center h-full text-text-muted text-sm font-mono">
            No entries yet. Add your first daily log to see the chart.
          </div>
        )}

        <div ref={chartRef} className="w-full h-64 md:h-80" />
      </div>
    </motion.div>
  )
}
