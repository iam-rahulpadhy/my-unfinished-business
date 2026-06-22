import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Trash2 } from 'lucide-react';
import { Milestone, MilestoneRequest } from '../api/milestones';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MilestoneRequest, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialData?: Milestone;
}

export default function MilestoneModal({ isOpen, onClose, onSave, onDelete, initialData }: MilestoneModalProps) {
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setTargetDate(initialData.targetDate);
        setIsCompleted(initialData.isCompleted);
      } else {
        setTitle('');
        setTargetDate('');
        setIsCompleted(false);
      }
      setConfirmDelete(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetDate) return;
    
    setIsSubmitting(true);
    try {
      await onSave({ title, targetDate, isCompleted }, initialData?.id);
      onClose();
    } catch (error) {
      console.error('Failed to save milestone', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-bg-surface border border-bg-border rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-bg-border/50">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 font-mono uppercase tracking-wider">
              <Target size={20} className="text-accent-bull" />
              {initialData ? 'Edit Milestone' : 'New Milestone'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-hover transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-text-secondary uppercase">
                Milestone Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Reach 1900 Rating on Codeforces"
                className="w-full bg-bg-base border border-bg-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-text-primary transition-colors font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-text-secondary uppercase">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-bg-base border border-bg-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-text-primary transition-colors font-mono"
                required
              />
            </div>

            {initialData && (
              <div className="flex items-center justify-between p-4 bg-bg-base border border-bg-border rounded-xl">
                <div>
                  <div className="font-medium text-text-primary">Mark as Completed</div>
                  <div className="text-xs text-text-muted mt-1">Check this if you've already achieved it!</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCompleted(!isCompleted)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    isCompleted ? 'bg-text-primary' : 'bg-bg-border'
                  }`}
                >
                  <motion.div
                    className="w-4 h-4 bg-bg-base rounded-full absolute top-1 shadow-sm"
                    animate={{ left: isCompleted ? 'calc(100% - 20px)' : '4px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-bg-border/50">
              {/* Delete button — only for existing milestones */}
              {initialData && onDelete ? (
                <motion.button
                  type="button"
                  onClick={() => {
                    if (confirmDelete) {
                      onDelete(initialData.id).then(onClose)
                    } else {
                      setConfirmDelete(true)
                      setTimeout(() => setConfirmDelete(false), 3000)
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                    confirmDelete
                      ? 'bg-accent-bear/10 border border-accent-bear/30 text-accent-bear font-semibold'
                      : 'text-text-muted hover:text-accent-bear/70 border border-transparent hover:border-accent-bear/20'
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  <Trash2 size={12} />
                  {confirmDelete ? 'Confirm delete?' : 'Delete'}
                </motion.button>
              ) : <div />}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title || !targetDate}
                  className="px-5 py-2.5 bg-text-primary text-bg-base text-sm font-bold rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : 'Save Milestone'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
