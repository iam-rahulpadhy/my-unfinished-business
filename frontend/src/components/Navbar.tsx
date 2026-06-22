import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, BookOpen, LogOut, TrendingUp, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { useStockSummary } from '../hooks/useData'
import apiClient from '../api/apiClient'
import clsx from 'clsx'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const username = useAuthStore((s) => s.username)
  const { theme, toggleTheme } = useThemeStore()
  const { data: summary } = useStockSummary()
  const [avatarKey, setAvatarKey] = useState(Date.now())

  useEffect(() => {
    const handleAvatarUpdate = () => setAvatarKey(Date.now())
    window.addEventListener('avatarUpdated', handleAvatarUpdate)
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate)
  }, [])

  const isPositive = (summary?.dailyChangePercent ?? 0) >= 0

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-bg-border"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-7 h-7 rounded-md bg-accent-bull/10 border border-accent-bull/20 flex items-center justify-center">
            <TrendingUp size={14} className="text-accent-bull" />
          </div>
          <div className="flex items-center">
            <span className="text-text-primary font-black tracking-tight text-sm">
              MY UNFINISHED BUSINESS
            </span>
          </div>
        </Link>

        {/* Center: live price ticker */}
        <div className="hidden md:flex items-center gap-3">
          {summary ? (
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="ticker-text text-text-primary text-lg">
                ₹{summary.currentPrice.toFixed(2)}
              </span>
              <span
                className={clsx(
                  'text-xs font-mono px-2 py-1 rounded',
                  isPositive ? 'bull-bg' : 'bear-bg'
                )}
              >
                {isPositive ? '+' : ''}
                {summary.dailyChangePercent.toFixed(2)}%
              </span>
            </motion.div>
          ) : (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="h-5 w-24 bg-bg-card rounded" />
              <div className="h-5 w-14 bg-bg-card rounded" />
            </div>
          )}
        </div>

        {/* Right: nav links + logout */}
        <div className="flex items-center gap-1">
          <NavLink to="/" icon={<LayoutDashboard size={16} />} label="Overview" active={location.pathname === '/'} />
          <NavLink to="/ledger" icon={<BookOpen size={16} />} label="Logbook" active={location.pathname === '/ledger'} />

          <div className="w-px h-5 bg-bg-border mx-2" />

          <div className="hidden md:flex items-center gap-2 mr-2 bg-bg-surface px-3 py-1.5 rounded-full border border-bg-border">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-bg-base border border-bg-border flex items-center justify-center">
              <img 
                src={`${apiClient.defaults.baseURL}/users/${username}/avatar?t=${avatarKey}`}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }}
              />
              <span className="hidden text-xs font-bold text-text-muted">
                {username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-text-muted text-xs font-mono">
              {username}
            </span>
          </div>

          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors mr-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>

          <motion.button
            onClick={handleLogout}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Logout"
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </div>
    </motion.nav>
  )
}

function NavLink({
  to, icon, label, active
}: { to: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link to={to}>
      <motion.div
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          active
            ? 'bg-bg-card text-text-primary border border-bg-border'
            : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {icon}
        <span className="hidden md:block">{label}</span>
      </motion.div>
    </Link>
  )
}
