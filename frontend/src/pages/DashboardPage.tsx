import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Settings } from 'lucide-react'
import apiClient from '../api/apiClient'
import Navbar from '../components/Navbar'
import PriceHeader, { StatBadge } from '../components/PriceHeader'
import StockChart from '../components/StockChart'
import ActiveMilestonesCard from '../components/ActiveMilestonesCard'
import LogEntryPanel from '../components/LogEntryPanel'
import LedgerCard from '../components/LedgerCard'
import SettingsModal from '../components/SettingsModal'
import { useStockSummary, useLedger } from '../hooks/useData'
import { useAuthStore } from '../store/authStore'
import type { DailyLedger, DailyLedgerRequest } from '../types'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

export default function DashboardPage() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<{ id: string; data: DailyLedgerRequest } | null>(null)
  const [chartRange, setChartRange] = useState<'1W' | '1M' | 'ALL'>('ALL')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [avatarKey, setAvatarKey] = useState(0)

  const { data: summary, isLoading: summaryLoading } = useStockSummary()
  const { data: ledgerEntries, isLoading: ledgerLoading } = useLedger()

  const displayName = useAuthStore((s) => s.displayName)
  const username = useAuthStore((s) => s.username)
  const bio = useAuthStore((s) => s.bio)
  const quotation = useAuthStore((s) => s.quotation)
  const captureButtonName = useAuthStore((s) => s.captureButtonName) || 'Daily Overview'
  const nameToDisplay = displayName || username || 'User'

  useEffect(() => {
    const handleAvatarUpdate = () => setAvatarKey(Date.now())
    window.addEventListener('avatarUpdated', handleAvatarUpdate)
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate)
  }, [])



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

  // Recent 5 entries for the dashboard feed
  const recentEntries = ledgerEntries ? [...ledgerEntries].reverse().slice(0, 5) : []

  // Unique tags for filter — memoized
  const availableTags = useMemo(() => {
    const allTags = new Set<string>()
    ledgerEntries?.forEach(e => {
      if (e.tags) {
        e.tags.split(',').map(t => t.trim()).forEach(t => { if (t) allTags.add(t) })
      }
    })
    return Array.from(allTags)
  }, [ledgerEntries])

  // Filtered entries for the charts — memoized
  const filteredEntries = useMemo(() => ledgerEntries?.filter(e => {
    if (!selectedTag) return true
    if (!e.tags) return false
    return e.tags.split(',').map(t => t.trim()).includes(selectedTag)
  }), [ledgerEntries, selectedTag])

  return (
    <motion.div
      className="min-h-screen bg-bg-base text-text-primary"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Navbar />

      <main className="pt-16 pb-20 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* ── CARD 1: Greeting & Bio (Col 2, Row 1) ── */}
            <div className="lg:col-span-2 glass-card p-8 flex items-center gap-6 border border-bg-border shadow-glass group/bio relative overflow-hidden">
              <button
                onClick={() => setSettingsOpen(true)}
                className="absolute top-6 right-6 p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors z-20"
                title="Profile Settings"
              >
                <Settings size={20} />
              </button>
              
              <div className="relative flex-shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-bg-border bg-bg-surface flex items-center justify-center shadow-inner">
                <img 
                  src={`${apiClient.defaults.baseURL}/users/${username}/avatar?t=${avatarKey}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => { 
                    e.currentTarget.style.display = 'none'; 
                    const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <span className="avatar-fallback absolute text-3xl font-bold text-text-muted -z-10" style={{ display: 'none' }}>
                  {nameToDisplay?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col justify-center">
                <div className="group flex items-center gap-3">
                  <h1 className="text-4xl font-black tracking-tight text-text-primary flex items-center flex-wrap">
                    Welcome back,&nbsp;
                  <span className="text-text-secondary">
                      {nameToDisplay}.
                    </span>
                  </h1>
                </div>

              <div className="flex flex-col mt-2">
                <span className="text-accent-bull text-base font-mono">
                  {bio || 'Add a subtitle (e.g. Competitive Programmer)'}
                </span>
                {quotation && (
                  <span className="text-text-muted text-sm italic mt-1">
                    "{quotation}"
                  </span>
                )}
              </div>
              </div>
            </div>

            {/* ── CARD 2: Progress Index (Col 1, Row 1) ── */}
            <div className="lg:col-span-1 glass-card p-8 border border-bg-border shadow-glass flex flex-col justify-center relative">
              <PriceHeader summary={summary} isLoading={summaryLoading} />
            </div>

            {/* ── CARD 3: Action Center (Col 1, Row 1) ── */}
            <div className="lg:col-span-1 glass-card p-8 border border-bg-border shadow-glass flex flex-col justify-center relative">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Quick Action</h3>
              <motion.button
                id="new-entry-btn"
                onClick={() => { setEditEntry(null); setPanelOpen(true) }}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-accent-bull text-bg-base font-bold tracking-wide transition-shadow"
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={20} />
                {captureButtonName}
              </motion.button>
              <p className="text-xs text-text-muted mt-4 leading-relaxed opacity-80">
                Log today's progress to update your heatmap and charts.
              </p>
            </div>

            {/* ── CARD 4: Chart & Heatmap (Col 3, Row 2) ── */}
            <div className="lg:col-span-3 lg:row-span-2 glass-card p-8 border border-bg-border shadow-glass flex flex-col relative overflow-hidden h-[450px]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6 relative z-10 flex-wrap gap-4">
                <h2 className="text-text-primary font-bold text-sm tracking-wide uppercase">Growth Chart</h2>
                
                <div className="flex items-center gap-4">
                  {/* Tag Filter */}
                  {availableTags.length > 0 && (
                    <select
                      value={selectedTag || ''}
                      onChange={e => setSelectedTag(e.target.value || null)}
                      className="bg-bg-surface border border-bg-border rounded-lg px-3 py-1.5 text-xs font-mono text-text-primary focus:outline-none focus:border-text-muted transition-colors appearance-none"
                    >
                      <option value="">All Tags</option>
                      {availableTags.map(t => (
                        <option key={t} value={t}>#{t}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex-1 relative z-10 overflow-hidden">
                <StockChart filteredEntries={filteredEntries} range={chartRange} onRangeChange={setChartRange} />
              </div>
            </div>

            {/* ── CARD 5: Logbook (Col 1, Row 2) ── */}
            <div className="lg:col-span-1 lg:row-span-2 glass-card p-6 border border-bg-border shadow-glass flex flex-col relative overflow-hidden h-[450px]">
              <div className="flex items-center justify-between mb-4 relative z-10 px-2">
                <h2 className="text-text-primary font-bold text-sm tracking-wide uppercase">Logbook</h2>
                <a href="/ledger" className="text-text-muted text-xs font-mono hover:text-text-primary transition-colors underline underline-offset-2">View all</a>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 relative z-10 pr-2 custom-scrollbar">
                {ledgerLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-16 animate-pulse" />)}
                  </div>
                ) : recentEntries.length === 0 ? (
                  <EmptyState onAdd={() => setPanelOpen(true)} />
                ) : (
                  recentEntries.map((entry) => (
                    <LedgerCard key={entry.id} entry={entry} onEdit={handleEdit} />
                  ))
                )}
              </div>
            </div>

            {/* ── ROW 3: Stats & Milestones ── */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-6">
              <div className="glass-card p-6 border border-bg-border shadow-glass flex justify-center text-center">
                <StatBadge label="7-DAY AVG" value={summary?.sevenDaySma != null ? `${summary.sevenDaySma.toFixed(2)}` : '—'} delay={0.1} />
              </div>
              <div className="glass-card p-6 border border-bg-border shadow-glass flex justify-center text-center">
                <StatBadge label="PEAK SCORE" value={summary?.allTimeHigh != null ? `${summary.allTimeHigh.toFixed(2)}` : '—'} valueColor="bull" delay={0.15} />
              </div>
              <div className="glass-card p-6 border border-bg-border shadow-glass flex justify-center text-center">
                <StatBadge label="LOWEST SCORE" value={summary?.allTimeLow != null ? `${summary.allTimeLow.toFixed(2)}` : '—'} valueColor="bear" delay={0.2} />
              </div>
              <div className="glass-card p-6 border border-bg-border shadow-glass flex justify-center text-center">
                <StatBadge label="DAYS OF PROGRESS" value={summary?.totalEntries.toString() || '0'} delay={0.25} />
              </div>
            </div>

            <div className="lg:col-span-2">
              <ActiveMilestonesCard />
            </div>

          </div>
        </div>
      </main>

      {/* Log Entry Slide Panel */}
      <LogEntryPanel
        isOpen={panelOpen}
        onClose={handleClosePanel}
        editEntry={editEntry}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </motion.div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      className="glass-card flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-12 h-12 rounded-full bg-accent-bull/10 border border-accent-bull/20 flex items-center justify-center mb-4">
        <Plus size={20} className="text-accent-bull" />
      </div>
      <p className="text-text-primary font-semibold mb-1">No entries yet</p>
      <p className="text-text-muted text-sm mb-5">Your journey begins with the first log.</p>
      <motion.button
        onClick={onAdd}
        className="px-5 py-2.5 rounded-lg bg-accent-bull text-bg-base font-bold text-sm"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        Log First Entry
      </motion.button>
    </motion.div>
  )
}
