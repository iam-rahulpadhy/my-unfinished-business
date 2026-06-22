import { useState, useEffect } from 'react'

import { motion } from 'framer-motion'
import { differenceInDays, parseISO, startOfDay } from 'date-fns'

import { Milestone, getMilestones, createMilestone, updateMilestone, deleteMilestone } from '../api/milestones'
import MilestoneModal from './MilestoneModal'

export default function ActiveMilestonesCard() {
  const [today, setToday] = useState(startOfDay(new Date()))
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const fetchMilestones = async () => {
    setIsLoading(true)
    setHasError(false)
    try {
      const data = await getMilestones()
      setMilestones(data)
    } catch (err) {
      console.error('Failed to fetch milestones', err)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMilestones()
    const timer = setInterval(() => setToday(startOfDay(new Date())), 1000 * 60 * 60)
    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-6 rounded-2xl bg-bg-surface/50 border border-bg-border/50 relative overflow-hidden h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-sm font-bold tracking-widest text-text-primary uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-bull animate-pulse" />
          ACTIVE MILESTONES
        </h2>
        <button
          onClick={() => {
            setEditingMilestone(undefined)
            setIsModalOpen(true)
          }}
          className="text-text-muted hover:text-text-primary transition-colors p-1"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3 relative z-10 justify-center">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-bg-surface/50 animate-pulse" />
            ))}
          </div>
        ) : hasError ? (
          <div className="text-sm text-accent-bear/70 text-center py-4 font-mono border border-dashed border-accent-bear/20 rounded-lg">
            Failed to load. <button onClick={fetchMilestones} className="underline hover:text-accent-bear transition-colors">Retry?</button>
          </div>
        ) : milestones.length === 0 ? (
          <div className="text-sm text-text-muted text-center py-4 font-mono border border-dashed border-bg-border/50 rounded-lg cursor-pointer hover:bg-bg-hover transition-colors" onClick={() => { setEditingMilestone(undefined); setIsModalOpen(true) }}>
            Click here to add your first milestone!
          </div>
        ) : (
          milestones.map(m => {
            const daysLeft = differenceInDays(parseISO(m.targetDate), today)
            const isUrgent = daysLeft <= 14 && daysLeft >= 0
            const isPassed = daysLeft < 0

            // Progress bar: % of time elapsed from createdAt → targetDate
            const totalDays = differenceInDays(parseISO(m.targetDate), parseISO(m.createdAt))
            const daysElapsed = differenceInDays(today, parseISO(m.createdAt))
            const progressPct = totalDays > 0 ? Math.min(Math.max(daysElapsed / totalDays, 0), 1) : 1

            return (
              <div
                key={m.id}
                className="flex flex-col gap-1.5 p-3 rounded-lg bg-bg-surface border border-bg-border/50 group hover:border-text-primary/30 transition-colors cursor-pointer"
                onClick={() => {
                  setEditingMilestone(m)
                  setIsModalOpen(true)
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${m.isCompleted ? 'bg-accent-bull' : 'bg-bg-border'}`} />
                    <span className={`text-sm font-mono truncate ${m.isCompleted ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                      {m.title}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-mono font-bold px-2 py-1 rounded shrink-0 ${
                    m.isCompleted ? 'text-accent-bull bg-accent-bull/10' :
                    isPassed ? 'text-text-muted bg-bg-hover' :
                    isUrgent ? 'text-accent-bear bg-accent-bear/10' :
                    'text-text-secondary bg-bg-hover'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
                    {m.isCompleted ? 'Done' : isPassed ? 'Passed' : `${daysLeft}d`}
                  </div>
                </div>
                {/* Progress bar */}
                {!m.isCompleted && !isPassed && (
                  <div className="h-[2px] w-full bg-bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isUrgent ? 'bg-accent-bear/60' : 'bg-white/20'}`}
                      style={{ width: `${progressPct * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <MilestoneModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingMilestone}
        onSave={async (data, id) => {
          if (id) {
            await updateMilestone(id, data)
          } else {
            await createMilestone(data)
          }
          fetchMilestones()
        }}
        onDelete={async (id) => {
          await deleteMilestone(id)
          fetchMilestones()
        }}
      />
    </motion.div>
  )
}
