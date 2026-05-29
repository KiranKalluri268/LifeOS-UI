import { Clock, Moon, Trash2 } from 'lucide-react'
import type { ActivityLog, SleepLog } from '@/db/types'
import { ACTIVITY_META, formatDuration } from '../time.types'
import { db } from '@/db'

interface DailyTimelineProps {
  logs: ActivityLog[]
  sleepLog: SleepLog | null
  totalMins: number
  byCategory: Record<string, number>
  onAddSleep: () => void
}

function TimelineBar({ logs }: { logs: ActivityLog[] }) {
  // Render a proportional horizontal bar across 24h
  const TOTAL_MINS_DAY = 24 * 60
  return (
    <div
      style={{
        display: 'flex',
        height: '28px',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.04)',
        overflow: 'hidden',
        marginBottom: '12px',
      }}
    >
      {logs.map((log) => {
        const start = new Date(log.startTime)
        const startMins = start.getHours() * 60 + start.getMinutes()
        const pctLeft  = (startMins / TOTAL_MINS_DAY) * 100
        const pctWidth = (log.durationMins / TOTAL_MINS_DAY) * 100
        const meta = ACTIVITY_META[log.category]
        return (
          <div
            key={log.id}
            title={`${meta.label}: ${formatDuration(log.durationMins)}`}
            style={{
              position: 'absolute',
              left: `${pctLeft}%`,
              width: `${Math.max(pctWidth, 0.5)}%`,
              height: '28px',
              background: meta.color,
              opacity: 0.85,
              borderRadius: '3px',
            }}
          />
        )
      })}
    </div>
  )
}

export default function DailyTimeline({ logs, sleepLog, totalMins, byCategory, onAddSleep }: DailyTimelineProps) {
  const handleDeleteLog = async (id: number) => {
    await db.activity_logs.delete(id)
  }

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <div>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 8px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Today</div>
          <div style={{ fontSize: '13px', color: '#a09db8', marginTop: '2px' }}>{today}</div>
        </div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#a09db8' }}>
          <Clock size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          {formatDuration(totalMins)} tracked
        </div>
      </div>

      {/* Timeline bar */}
      {logs.length > 0 && (
        <div style={{ padding: '0 16px', position: 'relative' }}>
          <TimelineBar logs={logs} />
          {/* Hour ticks */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-8px', marginBottom: '8px' }}>
            {['0', '6', '12', '18', '24'].map(h => (
              <span key={h} style={{ fontSize: '9px', color: '#6b6884' }}>{h}</span>
            ))}
          </div>
        </div>
      )}

      {/* Category breakdown chips */}
      {Object.keys(byCategory).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '4px 16px 12px' }}>
          {Object.entries(byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, mins]) => {
              const meta = ACTIVITY_META[cat as keyof typeof ACTIVITY_META]
              return (
                <div
                  key={cat}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '999px',
                    background: `${meta.color}18`,
                    border: `1px solid ${meta.color}30`,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: meta.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span>{meta.emoji}</span>
                  <span>{meta.label}</span>
                  <span style={{ opacity: 0.7 }}>{formatDuration(mins)}</span>
                </div>
              )
            })}
        </div>
      )}

      {/* Activity log rows */}
      {logs.length === 0 ? (
        <div style={{ padding: '20px 16px', textAlign: 'center', color: '#6b6884', fontSize: '13px' }}>
          No activity blocks logged today. Start the timer or add a block manually.
        </div>
      ) : (
        <div style={{ margin: '0 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '12px' }}>
          {logs.map((log, i) => {
            const meta = ACTIVITY_META[log.category]
            const start = new Date(log.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
            const end   = new Date(log.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
            return (
              <div
                key={log.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                  borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f0f7' }}>
                    {meta.emoji} {meta.label}
                    {log.note && <span style={{ color: '#a09db8', fontWeight: 400 }}> · {log.note}</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b6884', marginTop: '2px' }}>
                    {start} – {end} · {formatDuration(log.durationMins)}
                  </div>
                </div>
                <button
                  onClick={() => log.id != null && handleDeleteLog(log.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6884', padding: '4px', display: 'flex', borderRadius: '6px', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#6b6884' }}
                  aria-label="Delete log"
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Sleep entry / summary */}
      <div style={{ margin: '0 16px 16px' }}>
        {sleepLog ? (
          <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Moon size={18} color="#6366f1" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#6366f1' }}>
                {Math.floor(sleepLog.durationMins / 60)}h {sleepLog.durationMins % 60}m sleep
              </div>
              <div style={{ fontSize: '11px', color: '#a09db8', marginTop: '2px' }}>
                Quality: {'★'.repeat(sleepLog.quality)}{'☆'.repeat(5 - sleepLog.quality)}
              </div>
            </div>
            <button
              onClick={onAddSleep}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#6366f1', fontWeight: 600, fontFamily: 'inherit' }}
            >
              Edit
            </button>
          </div>
        ) : (
          <button
            onClick={onAddSleep}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '12px',
              background: 'rgba(99,102,241,0.06)', border: '1px dashed rgba(99,102,241,0.25)',
              color: '#6366f1', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'inherit', transition: 'background 0.2s',
            }}
          >
            <Moon size={15} /> Log last night's sleep
          </button>
        )}
      </div>
    </div>
  )
}
