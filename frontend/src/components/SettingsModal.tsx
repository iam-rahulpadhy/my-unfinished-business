import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import apiClient from '../api/apiClient'
import { authApi } from '../api/auth'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { captureButtonName, customDisciplines, updateProfile } = useAuthStore()
  
  const [btnName, setBtnName] = useState(captureButtonName || 'Daily Overview')
  const [disciplines, setDisciplines] = useState(
    customDisciplines ? customDisciplines.split(',').join('\n') : ''
  )
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const username = useAuthStore(s => s.username)

  useEffect(() => {
    if (isOpen) {
      setBtnName(captureButtonName || 'Daily Overview')
      setBtnName(captureButtonName || 'Daily Overview')
      setDisciplines(customDisciplines ? customDisciplines.split(',').join('\n') : '')
      setAvatarFile(null)
      setAvatarPreview(null)
    }
  }, [isOpen, captureButtonName, customDisciplines])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const formattedDisciplines = disciplines
        .split('\n')
        .map(d => d.trim())
        .filter(d => d.length > 0)
        .join(',')

      const res = await authApi.updateProfile({
        captureButtonName: btnName,
        customDisciplines: formattedDisciplines
      })

      updateProfile({
        captureButtonName: res.captureButtonName || null,
        customDisciplines: res.customDisciplines || null
      })

      if (avatarFile) {
        try {
          await authApi.updateAvatar(avatarFile)
          window.dispatchEvent(new Event('avatarUpdated'))
        } catch (avatarErr) {
          console.error('Failed to upload avatar', avatarErr)
        }
      }
    } catch (err) {
      console.error('Failed to save settings', err)
    } finally {
      setSaving(false)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-bg-surface border border-bg-border rounded-2xl shadow-2xl z-50 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: '-45%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-45%' }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
              <h2 className="text-lg font-bold text-text-primary">Customization</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center gap-4 border-b border-bg-border pb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-bg-border bg-bg-base flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : username ? (
                    <img 
                      src={`${apiClient.defaults.baseURL}/users/${username}/avatar`} 
                      alt="Current Avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  ) : null}
                  {!avatarPreview && (
                    <span className="absolute text-2xl font-bold text-text-muted -z-10">
                      {username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <label className="cursor-pointer bg-bg-surface hover:bg-bg-hover border border-bg-border text-text-primary px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Upload Picture
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp" 
                    className="hidden" 
                    onChange={handleAvatarChange} 
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Action Button Text
                </label>
                <input
                  type="text"
                  value={btnName}
                  onChange={(e) => setBtnName(e.target.value)}
                  maxLength={30}
                  className="w-full bg-bg-base border border-bg-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-bull transition-colors"
                  placeholder="e.g., Log Pos/Neg"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-text-muted">
                    Customize the text of the main capture button on your dashboard.
                  </p>
                  <span className={`text-xs font-mono ${btnName.length >= 28 ? 'text-accent-bear' : 'text-text-muted'}`}>
                    {btnName.length}/30
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Custom Disciplines
                </label>
                <textarea
                  value={disciplines}
                  onChange={(e) => setDisciplines(e.target.value)}
                  className="w-full h-32 bg-bg-base border border-bg-border rounded-lg px-4 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-accent-bull transition-colors resize-none"
                  placeholder="Meditation\nWorkout\nReading"
                />
                <p className="text-xs text-text-muted mt-2">
                  Enter your daily habits. Put each discipline on a new line.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-accent-bull text-bg-base hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
