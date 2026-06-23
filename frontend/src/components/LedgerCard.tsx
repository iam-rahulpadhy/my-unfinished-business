import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, TrendingUp, TrendingDown, Pencil, Trash2, Target } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import clsx from 'clsx'
import { ledgerApi } from '../api/ledger'
import type { DailyLedger } from '../types'

interface LedgerCardProps {
  entry: DailyLedger
  onEdit: (entry: DailyLedger) => void
}

export default function LedgerCard({ entry, onEdit }: LedgerCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => ledgerApi.delete(entry.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    },
  })

  const isPositive = (entry.percentageChange ?? 0) >= 0
  const isNeutral = entry.percentageChange === 0 || entry.percentageChange == null

  return (
    <motion.div
      layout
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      {/* Card Header (always visible) */}
      <button
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-bg-hover/30 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Date */}
        <div className="min-w-[70px] shrink-0">
          <p className="text-text-primary font-mono text-sm font-semibold">
            {format(new Date(entry.entryDate + 'T00:00:00'), 'MMM dd')}
          </p>
          <p className="text-text-muted font-mono text-[10px]">
            {format(new Date(entry.entryDate + 'T00:00:00'), 'yyyy')}
          </p>
        </div>

        {/* Price */}
        <div className="flex-1">
          <p className="font-sans font-medium text-text-primary text-xl tracking-tight">
            {Number(entry.closingPrice).toFixed(2)}
          </p>
        </div>

        {/* Change badge */}
        <div className={clsx(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold whitespace-nowrap shrink-0',
          isNeutral ? 'bg-bg-card text-text-secondary border border-bg-border' :
          isPositive ? 'bull-bg' : 'bear-bg'
        )}>
          {!isNeutral && (isPositive
            ? <TrendingUp size={11} />
            : <TrendingDown size={11} />
          )}
          {isPositive && !isNeutral ? '+' : ''}
          {Number(entry.percentageChange ?? 0).toFixed(2)}%
        </div>

        {/* Discipline dots */}
        <div className="flex items-center gap-1.5 ml-2">
          {entry.completedDisciplines && entry.completedDisciplines.split(',').map((d, i) => (
            <DisciplineDot key={i} active={true} title={d.trim()} />
          ))}
        </div>

        {/* Expand chevron */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-muted shrink-0"
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-bg-border pt-4 space-y-4">
              {/* Summary */}
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-widest font-mono mb-2">
                  Executive Summary
                </p>
                <p className="text-text-primary/90 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {entry.summaryText || <span className="italic text-text-muted">No summary recorded.</span>}
                </p>
              </div>

              {/* Tags */}
              {entry.tags && entry.tags.trim() && (
                <div className="flex flex-wrap gap-1.5">
                  {entry.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-[10px] font-mono border border-bg-border text-text-muted bg-bg-surface tracking-wider"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Discipline breakdown */}
              {entry.completedDisciplines ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {entry.completedDisciplines.split(',').map((discipline, i) => (
                    <DisciplineBlock
                      key={i}
                      icon={<Target size={13} />}
                      label={discipline.trim()}
                      active={true}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-xs italic font-mono mt-2">No disciplines recorded for this day.</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <motion.button
                  onClick={(e) => { e.stopPropagation(); onEdit(entry) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-bg-border text-text-muted text-xs hover:text-text-primary hover:bg-bg-hover transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Pencil size={12} />
                  Edit
                </motion.button>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirmDelete) {
                      deleteMutation.mutate()
                      setConfirmDelete(false)
                    } else {
                      setConfirmDelete(true)
                      setTimeout(() => setConfirmDelete(false), 3000)
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${confirmDelete
                    ? 'border-accent-bear bg-accent-bear/10 text-accent-bear font-semibold'
                    : 'border-accent-bear/20 text-accent-bear/60 hover:text-accent-bear hover:bg-accent-bear/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 size={12} />
                  {confirmDelete ? 'Confirm?' : 'Delete'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function DisciplineDot({ active, title }: { active: boolean; title: string }) {
  return (
    <div
      title={title}
      className={clsx(
        'w-2 h-2 rounded-full transition-colors',
        active ? 'bg-accent-bull' : 'bg-bg-border'
      )}
    />
  )
}

function DisciplineBlock({
  icon, label, active
}: { icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <div className={clsx(
      'flex flex-col items-center gap-2 px-3 py-3 rounded-lg border text-center',
      active
        ? 'border-accent-bull/20 bg-accent-bull/5 text-accent-bull'
        : 'border-bg-border bg-bg-base text-text-muted'
    )}>
      {icon}
      <span className="text-[10px] font-mono leading-tight">{label}</span>
      <span className={clsx(
        'text-[9px] font-mono font-semibold uppercase tracking-wider',
        active ? 'text-accent-bull' : 'text-text-muted'
      )}>
        {active ? 'Done' : 'Missed'}
      </span>
    </div>
  )
}
