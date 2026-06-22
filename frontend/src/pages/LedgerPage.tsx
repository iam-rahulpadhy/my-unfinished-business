import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, SortDesc } from 'lucide-react'
import Navbar from '../components/Navbar'
import LedgerCard from '../components/LedgerCard'
import LogEntryPanel from '../components/LogEntryPanel'
import { useLedger } from '../hooks/useData'
import type { DailyLedger, DailyLedgerRequest } from '../types'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

export default function LedgerPage() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<{ id: string; data: DailyLedgerRequest } | null>(null)
  const [search, setSearch] = useState('')
  const [sortDesc, setSortDesc] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const { data: entries, isLoading } = useLedger()

  const handleEdit = (entry: DailyLedger) => {
    setEditEntry({
      id: entry.id,
      data: {
        entryDate: entry.entryDate,
        closingPrice: Number(entry.closingPrice),
        summaryText: entry.summaryText,
        completedDisciplines: entry.completedDisciplines,
        tags: entry.tags ?? '',
      },
    })
    setPanelOpen(true)
  }

  const handleClosePanel = () => {
    setPanelOpen(false)
    setEditEntry(null)
  }

  const availableTags = useMemo(() => {
    const allTags = new Set<string>()
    entries?.forEach(e => {
      if (e.tags) e.tags.split(',').map(t => t.trim()).forEach(t => { if (t) allTags.add(t) })
    })
    return Array.from(allTags)
  }, [entries])

  const filtered = useMemo(() => (entries ?? [])
    .filter((e) =>
      (search === '' ||
      e.entryDate.includes(search) ||
      e.summaryText?.toLowerCase().includes(search.toLowerCase())) &&
      (!selectedTag || (e.tags && e.tags.split(',').map(t => t.trim()).includes(selectedTag)))
    )
    .sort((a, b) => {
      const cmp = a.entryDate.localeCompare(b.entryDate)
      return sortDesc ? -cmp : cmp
    }), [entries, search, sortDesc, selectedTag])

  return (
    <motion.div
      className="min-h-screen bg-bg-base text-text-primary"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Navbar />

      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-6 py-10">

          {/* ── Page Header ─────────────────────────────────────────────── */}
          <motion.div
            className="flex items-start justify-between gap-4 flex-wrap mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <p className="text-text-muted text-xs tracking-[0.25em] uppercase font-mono mb-1">
                Growth Ledger
              </p>
              <h1 className="text-2xl font-black tracking-tight">
                The Ledger
              </h1>
              <p className="text-text-muted text-sm mt-1">
                {entries ? `${entries.length} day${entries.length !== 1 ? 's' : ''} recorded` : 'Loading...'}
              </p>
            </div>

            <motion.button
              id="ledger-new-entry-btn"
              onClick={() => { setEditEntry(null); setPanelOpen(true) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent-bull text-bg-base font-bold text-sm shrink-0"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Plus size={16} />
              New Entry
            </motion.button>
          </motion.div>

          {/* ── Filters ─────────────────────────────────────────────────── */}
          <motion.div
            className="flex items-center gap-3 mb-6 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search by date or summary..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-bg-surface border border-bg-border rounded-lg pl-9 pr-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent-bull/50 transition-colors"
              />
            </div>
            {availableTags.length > 0 && (
              <select
                value={selectedTag || ''}
                onChange={e => setSelectedTag(e.target.value || null)}
                className="bg-bg-surface border border-bg-border rounded-lg px-3 py-2.5 text-xs font-mono text-text-primary focus:outline-none focus:border-text-muted transition-colors appearance-none cursor-pointer"
              >
                <option value="">All Tags</option>
                {availableTags.map(t => (
                  <option key={t} value={t}>#{t}</option>
                ))}
              </select>
            )}
            <motion.button
              onClick={() => setSortDesc((v) => !v)}
              title={sortDesc ? 'Newest first' : 'Oldest first'}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-bg-border text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SortDesc size={14} className={sortDesc ? 'text-accent-bull' : ''} />
              <span className="hidden sm:block text-xs font-mono">
                {sortDesc ? 'Newest' : 'Oldest'}
              </span>
            </motion.button>
          </motion.div>

          {/* ── Entries List ─────────────────────────────────────────────── */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="glass-card h-16 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              className="glass-card flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-text-muted text-sm">
                {search ? 'No entries match your search.' : 'No entries recorded yet.'}
              </p>
              {!search && (
                <motion.button
                  onClick={() => setPanelOpen(true)}
                  className="mt-4 px-5 py-2.5 rounded-lg bg-accent-bull text-bg-base font-bold text-sm"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Log First Entry
                </motion.button>
              )}
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {filtered.map((entry) => (
                  <LedgerCard key={entry.id} entry={entry} onEdit={handleEdit} />
                ))}
              </div>
            </AnimatePresence>
          )}

        </div>
      </main>

      <LogEntryPanel
        isOpen={panelOpen}
        onClose={handleClosePanel}
        editEntry={editEntry}
      />
    </motion.div>
  )
}
