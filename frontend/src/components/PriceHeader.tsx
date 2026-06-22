import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'
import type { StockSummary } from '../types'

interface PriceHeaderProps {
  summary: StockSummary | undefined
  isLoading: boolean
}

export default function PriceHeader({ summary, isLoading }: PriceHeaderProps) {
  if (isLoading || !summary) {
    return <PriceHeaderSkeleton />
  }

  const isPositive = summary.dailyChangePercent >= 0
  const isNeutral = summary.dailyChangePercent === 0

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Ticker label */}
      <div className="flex items-center gap-2">
        <span className="text-text-muted text-xs tracking-[0.25em] uppercase font-mono">
          PROGRESS
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-accent-bull animate-pulse" />
        <span className="text-text-muted text-xs font-mono">INDEX</span>
      </div>

      {/* Main price */}
      <div className="flex items-end gap-5 flex-wrap">
        <motion.span
          key={summary.currentPrice}
          className="font-sans font-medium text-text-primary"
          style={{ fontSize: '3.5rem', lineHeight: 1, letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {summary.currentPrice.toFixed(2)}
        </motion.span>

        {/* Daily change badge */}
        <motion.div
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold mb-1',
            isNeutral ? 'bg-bg-card text-text-secondary border border-bg-border' :
            isPositive ? 'bull-bg' : 'bear-bg'
          )}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <TrendIcon size={14} />
          {isPositive && !isNeutral ? '+' : ''}
          {summary.dailyChange.toFixed(2)}
          <span className="text-xs opacity-70">
            ({isPositive && !isNeutral ? '+' : ''}{summary.dailyChangePercent.toFixed(2)}%)
          </span>
        </motion.div>
      </div>

    </motion.div>
  )
}

export function StatBadge({
  label, value, valueColor, delay = 0
}: { label: string; value: string; valueColor?: 'bull' | 'bear'; delay?: number }) {
  const numericValue = parseFloat(value)
  const isNumeric = !isNaN(numericValue) && value !== '—' && numericValue !== 0
  // Preserve original format: integer values stay integers, decimals stay decimals
  const isDecimal = value.includes('.')
  const format = (n: number) => isDecimal ? n.toFixed(2) : Math.round(n).toString()

  const [displayValue, setDisplayValue] = useState(value)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (!isNumeric) { setDisplayValue(value); return }

    // Start from a small fraction so the animation is visible
    const duration = 800
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplayValue(format(numericValue * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }

    const t = setTimeout(() => { rafRef.current = requestAnimationFrame(animate) }, delay * 1000 + 80)
    return () => { clearTimeout(t); if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <p className="text-text-muted text-[10px] tracking-widest uppercase font-mono mb-1">{label}</p>
      <p className={clsx(
        'font-mono font-semibold text-sm tabular-nums',
        value === '—' ? 'text-text-primary' :
        valueColor === 'bull' ? 'text-accent-bull' :
        valueColor === 'bear' ? 'text-accent-bear' :
        'text-text-primary'
      )}>
        {displayValue}
      </p>
    </motion.div>
  )
}


function PriceHeaderSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 w-24 bg-bg-hover rounded" />
      <div className="h-14 w-48 bg-bg-hover rounded" />
      <div className="flex gap-4">
        <div className="h-8 w-20 bg-bg-hover rounded" />
        <div className="h-8 w-20 bg-bg-hover rounded" />
        <div className="h-8 w-20 bg-bg-hover rounded" />
      </div>
    </div>
  )
}
