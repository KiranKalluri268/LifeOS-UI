import { useState, useCallback } from 'react'
import { Moon, Check } from 'lucide-react'
import BottomSheet from '@/components/BottomSheet'
import { isoToLocal, localToISO, diffMins } from '../time.types'
import { db } from '@/db'
import type { SleepLog } from '@/db/types'

interface AddSleepSheetProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  /** Pre-fill with existing record for editing */
  existing?: SleepLog
}

function lastNightBedtime(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  d.setHours(23, 0, 0, 0)
  return isoToLocal(d.toISOString())
}

function thismorningWake(): string {
  const d = new Date()
  d.setHours(7, 0, 0, 0)
  return isoToLocal(d.toISOString())
}

const QUALITY_LABELS: Record<number, string> = {
  1: '😩 Terrible',
  2: '😕 Poor',
  3: '😐 OK',
  4: '😊 Good',
  5: '🌟 Great',
}

export default function AddSleepSheet({ isOpen, onClose, onSaved, existing }: AddSleepSheetProps) {
  const [bedLocal, setBedLocal]   = useState(existing ? isoToLocal(existing.bedtime)  : lastNightBedtime())
  const [wakeLocal, setWakeLocal] = useState(existing ? isoToLocal(existing.wakeTime) : thismorningWake())
  const [quality, setQuality]     = useState<1|2|3|4|5>(existing?.quality ?? 4)
  const [notes, setNotes]         = useState(existing?.notes ?? '')
  const [isSaving, setIsSaving]   = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const handleClose = useCallback(() => {
    onClose()
    setTimeout(() => {
      setBedLocal(lastNightBedtime())
      setWakeLocal(thismorningWake())
      setQuality(4)
      setNotes('')
      setError(null)
    }, 400)
  }, [onClose])

  const bedISO  = localToISO(bedLocal)
  const wakeISO = localToISO(wakeLocal)
  const durationMins = diffMins(bedISO, wakeISO)
  const canSave = durationMins >= 30

  const handleSave = async () => {
    setError(null)
    if (!canSave) { setError('Wake time must be at least 30 min after bedtime.'); return }
    setIsSaving(true)
    try {
      const now  = new Date().toISOString()
      const date = bedISO.slice(0, 10)

      if (existing?.id) {
        await db.sleep_logs.update(existing.id, {
          bedtime: bedISO, wakeTime: wakeISO, durationMins, quality,
          notes: notes.trim() || undefined, updatedAt: now,
        })
      } else {
        // Remove any existing sleep log for that date first
        const dup = await db.sleep_logs.where('date').equals(date).first()
        if (dup?.id) await db.sleep_logs.delete(dup.id)

        await db.sleep_logs.add({
          userId: 'local', date, bedtime: bedISO, wakeTime: wakeISO,
          durationMins, quality, notes: notes.trim() || undefined,
          syncStatus: 'pending', createdAt: now, updatedAt: now,
        })
      }
      onSaved()
      handleClose()
    } catch (err) {
      console.error(err)
      setError('Failed to save. Try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const hours = Math.floor(durationMins / 60)
  const mins  = durationMins % 60
  const sleepColor = hours >= 7 ? '#10b981' : hours >= 6 ? '#f59e0b' : '#ef4444'

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Log Sleep" accentColor="#6366f1">
      <div style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Moon icon + duration summary */}
        <div style={{ textAlign: 'center' }}>
          <Moon size={32} color="#6366f1" style={{ marginBottom: '8px' }} />
          {canSave && (
            <div>
              <span style={{ fontSize: '28px', fontWeight: 800, color: sleepColor }}>{hours}h {mins}m</span>
              <div style={{ fontSize: '12px', color: '#6b6884', marginTop: '2px' }}>sleep duration</div>
            </div>
          )}
        </div>

        {/* Bedtime & Wake time */}
        {[
          { label: 'Bedtime 🌙',  value: bedLocal,  onChange: setBedLocal  },
          { label: 'Wake time ☀️', value: wakeLocal, onChange: setWakeLocal },
        ].map(({ label, value, onChange }) => (
          <div key={label}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
              {label}
            </div>
            <input
              type="datetime-local"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#f1f0f7', fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                colorScheme: 'dark', boxSizing: 'border-box',
              }}
            />
          </div>
        ))}

        {/* Quality rating */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
            Sleep Quality
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {([1, 2, 3, 4, 5] as const).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuality(q)}
                style={{
                  flex: 1, padding: '10px 4px', borderRadius: '10px',
                  border: `1.5px solid ${quality === q ? '#6366f1' : 'rgba(255,255,255,0.07)'}`,
                  background: quality === q ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '18px' }}>{QUALITY_LABELS[q].split(' ')[0]}</span>
                <span style={{ fontSize: '9px', fontWeight: 700, color: quality === q ? '#6366f1' : '#6b6884' }}>{q}</span>
              </button>
            ))}
          </div>
          {quality > 0 && (
            <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '12px', color: '#6366f1', fontWeight: 600 }}>
              {QUALITY_LABELS[quality]}
            </div>
          )}
        </div>

        {/* Notes */}
        <input
          type="text"
          placeholder="Notes (optional — e.g. woke up twice)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
            background: canSave ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.06)',
            border: 'none', color: canSave ? '#fff' : '#6b6884',
            fontSize: '15px', fontWeight: 700, cursor: canSave ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: 'inherit', transition: 'all 0.2s',
          }}
        >
          <Check size={18} strokeWidth={2.5} />
          {isSaving ? 'Saving…' : canSave ? `Save — ${hours}h ${mins}m sleep` : 'Enter valid sleep times'}
        </button>
      </div>
    </BottomSheet>
  )
}
