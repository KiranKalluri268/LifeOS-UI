import { useState, useCallback } from 'react'
import { Check } from 'lucide-react'
import BottomSheet from '@/components/BottomSheet'
import { ACTIVITY_META, ACTIVITY_CATEGORIES, isoToLocal, localToISO, diffMins } from '../time.types'
import type { ActivityCategory } from '@/db/types'
import { db } from '@/db'

interface AddTimeBlockSheetProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

function nowLocal(): string {
  return isoToLocal(new Date().toISOString())
}

function hourAgoLocal(): string {
  const d = new Date()
  d.setHours(d.getHours() - 1)
  return isoToLocal(d.toISOString())
}

export default function AddTimeBlockSheet({ isOpen, onClose, onSaved }: AddTimeBlockSheetProps) {
  const [category, setCategory] = useState<ActivityCategory>('deep_work')
  const [startLocal, setStartLocal] = useState(hourAgoLocal())
  const [endLocal, setEndLocal] = useState(nowLocal())
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = useCallback(() => {
    onClose()
    setTimeout(() => {
      setStartLocal(hourAgoLocal())
      setEndLocal(nowLocal())
      setNote('')
      setError(null)
    }, 400)
  }, [onClose])

  const durationMins = diffMins(localToISO(startLocal), localToISO(endLocal))
  const canSave = durationMins >= 1

  const handleSave = async () => {
    setError(null)
    if (!canSave) { setError('End time must be after start time (min 1 minute).'); return }
    setIsSaving(true)
    try {
      const startISO = localToISO(startLocal)
      const endISO   = localToISO(endLocal)
      const date = startISO.slice(0, 10)
      const now  = new Date().toISOString()
      await db.activity_logs.add({
        userId: 'local',
        date,
        category,
        startTime: startISO,
        endTime: endISO,
        durationMins,
        note: note.trim() || undefined,
        syncStatus: 'pending',
        createdAt: now,
        updatedAt: now,
      })
      onSaved()
      handleClose()
    } catch (err) {
      console.error(err)
      setError('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const meta = ACTIVITY_META[category]

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Log Time Block" accentColor={meta.color}>
      <div style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Category grid */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
            Activity
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {ACTIVITY_CATEGORIES.map((cat) => {
              const m = ACTIVITY_META[cat]
              const isSelected = cat === category
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                    padding: '10px 4px', borderRadius: '12px',
                    border: `1.5px solid ${isSelected ? m.color : 'rgba(255,255,255,0.07)'}`,
                    background: isSelected ? `${m.color}18` : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{m.emoji}</span>
                  <span style={{ fontSize: '10px', fontWeight: isSelected ? 700 : 500, color: isSelected ? m.color : '#a09db8', textAlign: 'center', lineHeight: 1.2 }}>
                    {m.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Time inputs */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { label: 'Start', value: startLocal, onChange: setStartLocal },
            { label: 'End',   value: endLocal,   onChange: setEndLocal   },
          ].map(({ label, value, onChange }) => (
            <div key={label} style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
                {label}
              </div>
              <input
                type="datetime-local"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                  width: '100%', padding: '11px 10px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f1f0f7', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                  colorScheme: 'dark', boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
        </div>

        {/* Duration preview */}
        {canSave && (
          <div style={{ textAlign: 'center', padding: '8px', borderRadius: '10px', background: `${meta.color}10`, border: `1px solid ${meta.color}25` }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: meta.color }}>
              {meta.emoji}  {Math.floor(durationMins / 60)}h {durationMins % 60}m
            </span>
          </div>
        )}

        {/* Note */}
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{
            padding: '12px 14px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#f1f0f7', fontSize: '14px', fontFamily: 'inherit', outline: 'none',
          }}
        />

        {error && (
          <div style={{ color: '#ef4444', fontSize: '13px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isSaving || !canSave}
          style={{
            width: '100%', padding: '15px', borderRadius: '14px',
            background: canSave ? `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)` : 'rgba(255,255,255,0.06)',
            border: 'none', color: canSave ? '#fff' : '#6b6884',
            fontSize: '15px', fontWeight: 700, cursor: canSave ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: 'inherit', transition: 'all 0.2s',
          }}
        >
          <Check size={18} strokeWidth={2.5} />
          {isSaving ? 'Saving…' : 'Save Block'}
        </button>
      </div>
    </BottomSheet>
  )
}
