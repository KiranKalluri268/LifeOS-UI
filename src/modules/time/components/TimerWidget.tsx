import { useState, useEffect } from 'react'
import { Play, Square, ChevronDown } from 'lucide-react'
import { useActiveTimer } from '../hooks/useActiveTimer'
import { ACTIVITY_META, ACTIVITY_CATEGORIES, formatElapsed } from '../time.types'
import type { ActivityCategory } from '@/db/types'

export default function TimerWidget() {
  const { timer, isRunning, start, stop } = useActiveTimer()
  const [elapsed, setElapsed] = useState('00:00')
  const [selectedCat, setSelectedCat] = useState<ActivityCategory>('deep_work')
  const [isStopping, setIsStopping] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  // Tick elapsed every second when running
  useEffect(() => {
    if (!isRunning || !timer) {
      setElapsed('00:00')
      return
    }
    const tick = () => setElapsed(formatElapsed(timer.startTime))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isRunning, timer])

  const handleStart = async () => {
    await start(selectedCat)
  }

  const handleStop = async () => {
    setIsStopping(true)
    try {
      await stop()
    } finally {
      setIsStopping(false)
    }
  }

  const activeMeta = isRunning && timer ? ACTIVITY_META[timer.category] : ACTIVITY_META[selectedCat]
  const accentColor = activeMeta.color

  return (
    <div
      style={{
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${accentColor}30`,
        overflow: 'hidden',
        boxShadow: isRunning ? `0 0 30px ${accentColor}15` : 'none',
        transition: 'box-shadow 0.4s ease, border-color 0.3s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {isRunning ? 'Running' : 'Timer'}
        </span>
        {isRunning && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: accentColor,
              padding: '2px 8px',
              borderRadius: '999px',
              background: `${accentColor}18`,
              animation: 'pulse 2s infinite',
            }}
          >
            ● LIVE
          </span>
        )}
      </div>

      <div style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Elapsed display */}
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: '11px', color: '#6b6884', marginBottom: '4px' }}>
            {isRunning ? activeMeta.emoji + '  ' + activeMeta.label : 'Select activity'}
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 800,
              color: isRunning ? accentColor : '#3a3854',
              letterSpacing: '-2px',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              transition: 'color 0.3s ease',
            }}
          >
            {elapsed}
          </div>
        </div>

        {/* Category selector (only when not running) */}
        {!isRunning && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowPicker(!showPicker)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                background: `${accentColor}10`,
                border: `1.5px solid ${accentColor}30`,
                color: '#f1f0f7',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '18px' }}>{ACTIVITY_META[selectedCat].emoji}</span>
              <span style={{ flex: 1, textAlign: 'left', color: accentColor }}>{ACTIVITY_META[selectedCat].label}</span>
              <ChevronDown size={16} color="#6b6884" style={{ transform: showPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {showPicker && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  marginTop: '4px',
                  borderRadius: '12px',
                  background: '#1e1e2a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                {ACTIVITY_CATEGORIES.map((cat) => {
                  const meta = ACTIVITY_META[cat]
                  const isSelected = cat === selectedCat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setSelectedCat(cat); setShowPicker(false) }}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: isSelected ? `${meta.color}15` : 'transparent',
                        border: 'none',
                        color: isSelected ? meta.color : '#a09db8',
                        fontSize: '14px',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{meta.emoji}</span>
                      {meta.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Start / Stop button */}
        {isRunning ? (
          <button
            onClick={handleStop}
            disabled={isStopping}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(239,68,68,0.12)',
              border: '1.5px solid rgba(239,68,68,0.3)',
              color: '#ef4444',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            <Square size={16} strokeWidth={2.5} fill="#ef4444" />
            {isStopping ? 'Saving…' : 'Stop & Save'}
          </button>
        ) : (
          <button
            onClick={handleStart}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              border: 'none',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: 'inherit',
              boxShadow: `0 4px 16px ${accentColor}40`,
              transition: 'all 0.2s',
            }}
          >
            <Play size={16} strokeWidth={2.5} fill="#fff" />
            Start Timer
          </button>
        )}
      </div>
    </div>
  )
}
