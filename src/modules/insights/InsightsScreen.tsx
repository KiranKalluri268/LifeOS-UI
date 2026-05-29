import { Wifi, WifiOff } from 'lucide-react'
import { useInsightsEngine } from './hooks/useInsightsEngine'
import InsightCard from './components/InsightCard'
import WeeklyDigest from './components/WeeklyDigest'
import { useOnline } from '@/hooks/useOnline'

export default function InsightsScreen() {
  const { cards, digest, isReady } = useInsightsEngine()
  const isOnline = useOnline()

  if (!isReady) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b6884' }}>
        Analyzing data...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100%', paddingBottom: '100px' }}>
      
      {/* ── Sync status header ───────────────────────────────────────────── */}
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '999px',
            background: isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${isOnline ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}
        >
          {isOnline ? <Wifi size={14} color="#10b981" /> : <WifiOff size={14} color="#ef4444" />}
          <span style={{ fontSize: '11px', fontWeight: 600, color: isOnline ? '#10b981' : '#ef4444' }}>
            {isOnline ? 'Cloud Sync Active' : 'Offline Mode (Local Only)'}
          </span>
        </div>
      </div>

      {/* ── Weekly Digest ────────────────────────────────────────────────── */}
      <WeeklyDigest digest={digest} />

      {/* ── Cross-module Insights ────────────────────────────────────────── */}
      <div style={{ padding: '24px 16px 8px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '16px' }}>
          Cross-Module Insights
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cards.map((card) => (
            <InsightCard key={card.id} card={card} />
          ))}
        </div>
      </div>

    </div>
  )
}
