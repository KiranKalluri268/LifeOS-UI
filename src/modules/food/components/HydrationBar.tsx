import { Droplets } from 'lucide-react'
import type { DailyLiquidSummary } from '../hooks/useDailyLiquids'

interface HydrationBarProps {
  summary: DailyLiquidSummary
  onAdd: () => void
}

export default function HydrationBar({ summary, onAdd }: HydrationBarProps) {
  const { totalMl, targetMl, percentage, percentageRaw } = summary

  // Color transitions: blue → teal → green as you approach target
  const barColor =
    percentage < 50 ? '#3b82f6' :
    percentage < 80 ? '#06b6d4' :
    percentage < 100 ? '#10b981' :
    '#f59e0b' // amber if over target

  const displayMl = totalMl >= 1000
    ? `${(totalMl / 1000).toFixed(1)}L`
    : `${totalMl}ml`

  const targetDisplay = `${targetMl / 1000}L`

  return (
    <button
      onClick={onAdd}
      aria-label={`Hydration: ${displayMl} of ${targetDisplay}. Tap to log a drink.`}
      style={{
        width: '100%',
        padding: '14px 16px',
        borderRadius: '14px',
        background: 'rgba(59,130,246,0.06)',
        border: '1px solid rgba(59,130,246,0.15)',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.1)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.06)' }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Droplets size={16} color={barColor} strokeWidth={2} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#a09db8' }}>Hydration</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: barColor }}>
            {displayMl}
          </span>
          <span style={{ fontSize: '11px', color: '#6b6884' }}>/ {targetDisplay}</span>
          {percentageRaw > 100 && (
            <span style={{ fontSize: '11px', color: '#f59e0b', marginLeft: '4px' }}>🎉</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: '6px',
          borderRadius: '999px',
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            borderRadius: '999px',
            background: `linear-gradient(90deg, #3b82f6, ${barColor})`,
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s ease',
            boxShadow: `0 0 8px ${barColor}60`,
          }}
        />
      </div>

      {/* Drop icons for visual progress */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const filled = (percentage / 100) * 8 > i
          return (
            <Droplets
              key={i}
              size={12}
              color={filled ? barColor : '#3a3852'}
              strokeWidth={2}
              style={{ transition: 'color 0.3s ease' }}
            />
          )
        })}
        <span style={{ fontSize: '11px', color: '#6b6884', marginLeft: 'auto' }}>
          Tap to log +
        </span>
      </div>
    </button>
  )
}
