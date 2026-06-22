import { motion } from 'framer-motion'
import clsx from 'clsx'

interface BooleanToggleProps {
  id: string
  label: string
  value: boolean
  onChange: (value: boolean) => void
  activeColor?: 'bull' | 'bear' | 'neutral'
}

export default function BooleanToggle({
  id, label, value, onChange, activeColor = 'bull'
}: BooleanToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <label htmlFor={id} className="text-text-secondary text-sm cursor-pointer select-none">
        {label}
      </label>
      <motion.button
        id={id}
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={clsx(
          'relative w-11 h-6 rounded-full border transition-colors duration-200',
          value
            ? activeColor === 'bull' ? 'bg-accent-bull/20 border-accent-bull/40'
              : 'bg-accent-bear/20 border-accent-bear/40'
            : 'bg-bg-base border-bg-border'
        )}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className={clsx(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-colors',
            value
              ? activeColor === 'bull' ? 'bg-accent-bull' : 'bg-accent-bear'
              : 'bg-bg-border'
          )}
          animate={{ x: value ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  )
}
