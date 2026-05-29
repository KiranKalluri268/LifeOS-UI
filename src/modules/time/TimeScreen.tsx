import { useState } from 'react'
import { Plus, Moon } from 'lucide-react'
import TimerWidget from './components/TimerWidget'
import AddTimeBlockSheet from './components/AddTimeBlockSheet'
import AddSleepSheet from './components/AddSleepSheet'
import DailyTimeline from './components/DailyTimeline'
import WeeklySummaryCard from './components/WeeklySummaryCard'
import { useDailyActivityLog } from './hooks/useDailyActivityLog'

export default function TimeScreen() {
  const [blockSheetOpen, setBlockSheetOpen] = useState(false)
  const [sleepSheetOpen, setSleepSheetOpen] = useState(false)

  const { logs, sleepLog, totalMins, byCategory } = useDailyActivityLog()

  return (
    <div style={{ minHeight: '100%', position: 'relative', paddingBottom: '120px' }}>

      {/* ── Timer widget ─────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 16px 8px' }}>
        <TimerWidget />
      </div>

      {/* ── Daily timeline ───────────────────────────────────────────────── */}
      <DailyTimeline
        logs={logs}
        sleepLog={sleepLog}
        totalMins={totalMins}
        byCategory={byCategory}
        onAddSleep={() => setSleepSheetOpen(true)}
      />

      {/* ── Weekly summary card ──────────────────────────────────────────── */}
      <div style={{ padding: '4px 16px 16px' }}>
        <WeeklySummaryCard />
      </div>

      {/* ── FABs ─────────────────────────────────────────────────────────── */}
      {/* Sleep FAB */}
      <button
        id="log-sleep-fab"
        onClick={() => setSleepSheetOpen(true)}
        aria-label="Log sleep"
        style={{
          position: 'fixed',
          bottom: '152px',
          right: '20px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          transition: 'transform 0.15s ease',
          zIndex: 49,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
      >
        <Moon size={20} color="#fff" strokeWidth={2} />
      </button>

      {/* Add block FAB */}
      <button
        id="add-time-block-fab"
        onClick={() => setBlockSheetOpen(true)}
        aria-label="Add time block"
        style={{
          position: 'fixed',
          bottom: '88px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(99,102,241,0.45)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          zIndex: 49,
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(99,102,241,0.6)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(99,102,241,0.45)'
        }}
      >
        <Plus size={24} color="#fff" strokeWidth={2.5} />
      </button>

      {/* ── Sheets ───────────────────────────────────────────────────────── */}
      <AddTimeBlockSheet
        isOpen={blockSheetOpen}
        onClose={() => setBlockSheetOpen(false)}
        onSaved={() => setBlockSheetOpen(false)}
      />
      <AddSleepSheet
        isOpen={sleepSheetOpen}
        onClose={() => setSleepSheetOpen(false)}
        onSaved={() => setSleepSheetOpen(false)}
        existing={sleepLog ?? undefined}
      />
    </div>
  )
}
