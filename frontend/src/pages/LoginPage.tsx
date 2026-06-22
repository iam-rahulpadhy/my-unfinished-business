import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'

type Mode = 'login' | 'register' | 'forgot' | 'reset'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

const formVariants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, x: -12, transition: { duration: 0.2 } },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetKey, setResetKey] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const clearState = () => {
    setError(null)
    setSuccess(null)
    setPassword('')
    setConfirmPassword('')
    setResetKey('')
    setNewPassword('')
  }

  const switchMode = (m: Mode) => {
    clearState()
    setMode(m)
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await authApi.login({ username, password })
      setAuth(res.token, res.username, res.displayName || null, res.bio || null, res.captureButtonName || null, res.customDisciplines || null, res.role)
      navigate('/')
    } catch {
      setError('Invalid credentials. Check your username and password.')
    } finally {
      setLoading(false)
    }
  }

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.register({ username, email, password, displayName })
      setAuth(res.token, res.username, res.displayName || null, res.bio || null, res.captureButtonName || null, res.customDisciplines || null, res.role)
      navigate('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Registration failed. Username or email may already exist.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Forgot Password ────────────────────────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      await authApi.requestPasswordReset(email)
      setSuccess('Reset code sent! Check your email (or the backend console logs).')
      setTimeout(() => switchMode('reset'), 2500)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to send reset link.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Reset Password ─────────────────────────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      await authApi.resetPassword({ token: resetKey, newPassword })
      setSuccess('Password reset successful. You can now log in.')
      setTimeout(() => switchMode('login'), 1800)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Reset failed. Invalid or expired token.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const modeConfig = {
    login:    { title: 'Login',           submitLabel: 'LOGIN →', loadingLabel: 'AUTHENTICATING...' },
    register: { title: 'Create Account',  submitLabel: 'CREATE ACCOUNT →',  loadingLabel: 'CREATING...' },
    forgot:   { title: 'Forgot Password', submitLabel: 'SEND RESET CODE →', loadingLabel: 'SENDING...' },
    reset:    { title: 'Reset Password',  submitLabel: 'CONFIRM NEW PASSWORD →',  loadingLabel: 'RESETTING...' },
  }

  const onSubmit = mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : mode === 'forgot' ? handleForgot : handleReset

  return (
    <motion.div
      className="min-h-screen bg-bg-base flex items-center justify-center"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-bull opacity-[0.03] blur-[120px]" />
      </div>

      <div className="w-full max-w-sm px-6">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <p className="text-text-muted text-xs tracking-[0.3em] uppercase mb-3 font-mono">Personal Overview</p>
          <h1 className="text-4xl font-black tracking-tight text-text-primary">
            MY UNFINISHED
            <br />
            <span className="bull">BUSINESS</span>
          </h1>
          <p className="text-text-muted text-sm mt-3 font-light italic">My life, unedited.</p>
        </motion.div>

        {/* Mode Tabs */}
        {(mode === 'login' || mode === 'register') && (
          <motion.div
            className="flex items-center gap-1 bg-bg-surface border border-bg-border rounded-xl p-1 mb-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-lg text-xs font-mono font-semibold transition-all capitalize ${
                  mode === m
                    ? 'bg-bg-card text-text-primary border border-bg-border'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {m}
              </button>
            ))}
          </motion.div>
        )}

        <motion.div
          className="glass-card p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={onSubmit}
              className="space-y-4"
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Username — login & register */}
              {(mode === 'login' || mode === 'register') && (
                <div>
                  <label className="text-xs text-text-secondary uppercase tracking-wider font-mono mb-2 block">
                    Username
                  </label>
                  <input
                    id="auth-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-bg-base border border-bg-border rounded-lg px-4 py-4 text-text-primary text-sm focus:outline-none focus:border-accent-bull transition-colors"
                    placeholder="your_username"
                    required
                    autoFocus
                  />
                </div>
              )}

              {/* Email — register & forgot */}
              {(mode === 'register' || mode === 'forgot') && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <label className="text-xs text-text-secondary uppercase tracking-wider font-mono mb-2 block">
                    Email Address
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-bg-base border border-bg-border rounded-lg px-4 py-4 text-text-primary text-sm focus:outline-none focus:border-accent-bull transition-colors"
                    placeholder="you@example.com"
                    required
                    autoFocus={mode === 'forgot'}
                  />
                </motion.div>
              )}

              {/* Display Name — register only */}
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <label className="text-xs text-text-secondary uppercase tracking-wider font-mono mb-2 block">
                    Display Name
                  </label>
                  <input
                    id="auth-display-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-bg-base border border-bg-border rounded-lg px-4 py-4 text-text-primary text-sm focus:outline-none focus:border-accent-bull transition-colors"
                    placeholder="Your actual name"
                  />
                </motion.div>
              )}

              {/* Password — login & register */}
              {(mode === 'login' || mode === 'register') && (
                <div>
                  <label className="text-xs text-text-secondary uppercase tracking-wider font-mono mb-2 block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-bg-base border border-bg-border rounded-lg pl-4 pr-12 py-4 text-text-primary text-sm focus:outline-none focus:border-accent-bull transition-colors"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-text-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password — register only */}
              {mode === 'register' && (
                <div>
                  <label className="text-xs text-text-secondary uppercase tracking-wider font-mono mb-2 block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-bg-base border border-bg-border rounded-lg pl-4 pr-12 py-4 text-text-primary text-sm focus:outline-none focus:border-accent-bull transition-colors"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-text-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Reset Key — reset mode only */}
              {mode === 'reset' && (
                <>
                  <div>
                    <label className="text-xs text-text-secondary uppercase tracking-wider font-mono mb-2 block">
                      6-Digit Reset Code
                    </label>
                    <input
                      id="auth-reset-key"
                      type="text"
                      value={resetKey}
                      onChange={(e) => setResetKey(e.target.value)}
                      className="w-full bg-bg-base border border-bg-border rounded-lg px-4 py-4 text-text-primary text-sm focus:outline-none focus:border-accent-bull transition-colors text-center tracking-[0.5em] font-bold"
                      placeholder="000000"
                      maxLength={6}
                      required
                      autoComplete="off"
                    />
                    <p className="text-text-muted text-[10px] font-mono mt-1.5 text-center">
                      We've sent a 6-digit verification code to your email.
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary uppercase tracking-wider font-mono mb-2 block">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="auth-new-password"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-bg-base border border-bg-border rounded-lg pl-4 pr-12 py-4 text-text-primary text-sm focus:outline-none focus:border-accent-bull transition-colors"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-text-primary transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Error / Success */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    className="text-red-500 text-xs font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
                {success && (
                  <motion.p
                    className="text-green-500 text-xs font-mono bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {success}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                id="auth-submit"
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-lg bg-accent-bull text-bg-base font-bold text-sm tracking-wide disabled:opacity-50 transition-opacity"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {loading ? modeConfig[mode].loadingLabel : modeConfig[mode].submitLabel}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          {/* Forgot Password link — login mode only */}
          {mode === 'login' && (
            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-text-muted text-xs font-mono hover:text-text-primary transition-colors underline underline-offset-2"
              >
                Forgot password?
              </button>
            </motion.div>
          )}

          {/* Back to login — forgot/reset mode */}
          {(mode === 'forgot' || mode === 'reset') && (
            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-text-muted text-xs font-mono hover:text-text-primary transition-colors"
              >
                ← Back to login
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
