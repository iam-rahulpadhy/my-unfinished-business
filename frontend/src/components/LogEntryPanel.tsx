import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Calendar, IndianRupee, FileText, Target, Tag } from 'lucide-react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { ledgerApi } from '../api/ledger'
import type { DailyLedgerRequest } from '../types'
import BooleanToggle from './BooleanToggle'
import { useAuthStore } from '../store/authStore'

interface LogEntryPanelProps {
  isOpen: boolean
  onClose: () => void
  editEntry?: { id: string; data: DailyLedgerRequest } | null
}

const today = new Date().toISOString().split('T')[0]

const defaultForm: DailyLedgerRequest = {
  entryDate: today,
  closingPrice: 100,
  summaryText: '',
  completedDisciplines: '',
  tags: '',
}

export default function LogEntryPanel({ isOpen, onClose, editEntry }: LogEntryPanelProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<DailyLedgerRequest>(defaultForm)
  const [error, setError] = useState<string | null>(null)
  const [newTag, setNewTag] = useState('')

  // Reset form whenever panel opens or editEntry changes
  useEffect(() => {
    if (isOpen) {
      setForm(editEntry?.data ?? defaultForm)
      setError(null)
      setNewTag('')
    }
  }, [isOpen, editEntry])
  
  // Derive available tags from all ledger entries
  const { data: allEntries } = useQuery({ queryKey: ['ledger'], queryFn: ledgerApi.getAll })
  const availableTags: string[] = Array.from(new Set(
    (allEntries ?? []).flatMap(e => e.tags ? e.tags.split(',').map(t => t.trim()).filter(Boolean) : [])
  ))
  
  const { customDisciplines } = useAuthStore()
  const activeDisciplines = customDisciplines
    ? customDisciplines.split(',').map((d: string) => d.trim())
    : []

  const isCompleted = (discipline: string) => {
    if (!form.completedDisciplines) return false;
    const completedList = form.completedDisciplines.split(',').map(d => d.trim());
    return completedList.includes(discipline);
  };

  const handleToggle = (discipline: string, value: boolean) => {
    let completedList = form.completedDisciplines ? form.completedDisciplines.split(',').map(d => d.trim()).filter(Boolean) : [];
    if (value) {
      if (!completedList.includes(discipline)) completedList.push(discipline);
    } else {
      completedList = completedList.filter(d => d !== discipline);
    }
    setForm(p => ({ ...p, completedDisciplines: completedList.join(',') }));
  }

  const toggleTag = (tag: string) => {
    let tagList = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    if (tagList.includes(tag)) {
      tagList = tagList.filter(t => t !== tag)
    } else {
      tagList.push(tag)
    }
    setForm(p => ({ ...p, tags: tagList.join(',') }))
  }

  const handleNewTagSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const tag = newTag.trim()
      if (tag) {
        toggleTag(tag)
        setNewTag('')
      }
    }
  }

  const createMutation = useMutation({
    mutationFn: ledgerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      onClose()
      setForm(defaultForm)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to save entry.'
      setError(msg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DailyLedgerRequest }) =>
      ledgerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      onClose()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to update entry.'
      setError(msg)
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (editEntry) {
      updateMutation.mutate({ id: editEntry.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const panelVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: { duration: 0.25, ease: 'easeIn' }
    },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sliding Panel */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md glass border-l border-bg-border flex flex-col"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-bg-border">
              <div>
                <h2 className="text-text-primary font-bold text-base">
                  {editEntry ? 'Edit Entry' : 'Journal Entry'}
                </h2>
                <p className="text-text-muted text-xs mt-0.5 font-mono">
                  Progress Reflection
                </p>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
              {/* Date */}
              <div>
                <label className="flex items-center gap-2 text-xs text-text-muted uppercase tracking-wider font-mono mb-2">
                  <Calendar size={12} />
                  Entry Date
                </label>
                <input
                  id="entry-date"
                  type="date"
                  value={form.entryDate}
                  onChange={(e) => setForm((p) => ({ ...p, entryDate: e.target.value }))}
                  className="w-full bg-bg-base border border-bg-border rounded-lg px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent-bull/50 transition-colors font-mono"
                  required
                />
              </div>

              {/* Growth Index */}
              <div>
                <label className="flex items-center gap-2 text-xs text-text-muted uppercase tracking-wider font-mono mb-2">
                  <IndianRupee size={12} />
                  Today's Growth Index
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">₹</span>
                  <input
                    id="closing-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.closingPrice}
                    onChange={(e) => setForm((p) => ({ ...p, closingPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-bg-base border border-bg-border rounded-lg pl-8 pr-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent-bull/50 transition-colors font-mono"
                    required
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="flex items-center gap-2 text-xs text-text-muted uppercase tracking-wider font-mono mb-2">
                  <FileText size={12} />
                  Executive Summary
                </label>
                <textarea
                  id="summary-text"
                  value={form.summaryText}
                  onChange={(e) => setForm((p) => ({ ...p, summaryText: e.target.value }))}
                  placeholder="• What I executed today&#10;• Key wins or losses&#10;• Tomorrow's objective"
                  className="w-full bg-bg-base border border-bg-border rounded-lg px-4 py-4 text-text-primary text-sm focus:outline-none focus:border-accent-bull/50 transition-colors resize-none h-48 font-sans leading-relaxed"
                  required
                />
              </div>

              {/* Discipline Toggles */}
              <div className="glass-card px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={12} className="text-accent-bull" />
                  <span className="text-xs text-text-muted uppercase tracking-wider font-mono">
                    Discipline
                  </span>
                </div>
                <div className="divide-y divide-bg-border">
                  {activeDisciplines.map((discipline) => (
                    <BooleanToggle
                      key={discipline}
                      id={`toggle-${discipline}`}
                      label={discipline}
                      value={isCompleted(discipline)}
                      onChange={(v) => handleToggle(discipline, v)}
                    />
                  ))}
                </div>
              </div>

              {/* Focus Tags */}
              <div className="glass-card px-4 py-4">
                <label className="flex items-center gap-2 text-xs text-text-muted uppercase tracking-wider font-mono mb-3">
                  <Tag size={12} className="text-accent-bull" />
                  Focus Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => {
                    const isSelected = form.tags ? form.tags.split(',').map(t => t.trim()).includes(tag) : false;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 border ${
                          isSelected 
                            ? 'bg-text-primary text-bg-base border-text-primary' 
                            : 'bg-transparent text-text-muted border-bg-border hover:border-text-muted'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                  {/* New Tag Input */}
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="+ New Tag"
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      onKeyDown={handleNewTagSubmit}
                      className="px-3 py-1.5 bg-transparent border border-bg-border rounded-full text-xs font-mono text-text-primary focus:outline-none focus:border-text-muted w-24 transition-all focus:w-32 placeholder:text-text-muted"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <motion.p
                  className="text-accent-bear text-xs font-mono bg-accent-bear/10 border border-accent-bear/20 rounded-lg px-3 py-2"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </form>

            {/* Panel Footer */}
            <div className="px-6 py-5 border-t border-bg-border">
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-lg border border-bg-border text-text-secondary text-sm font-semibold hover:bg-bg-hover transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="flex-1 py-3 rounded-lg bg-accent-bull text-bg-base text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-bg-base border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={16} />
                      {editEntry ? 'Update Entry' : 'Log Entry'}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
