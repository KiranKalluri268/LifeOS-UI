import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { Moon } from 'lucide-react'
import { ACTIVITY_META, formatDuration } from '../time.types'
import { useWeeklySummary } from '../hooks/useWeeklySummary'

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0)
  return (
    <div style={{ background: '#1e1e2a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', minWidth: '120px' }}>
      <div style={{ fontWeight: 700, color: '#f1f0f7', marginBottom: '6px' }}>{label} — {total.toFixed(1)}h</div>
      {payload.filter(p => p.value > 0).map((p) => {
        const meta = ACTIVITY_META[p.name as keyof typeof ACTIVITY_META]
        return (
          <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: p.color, marginBottom: '2px' }}>
            <span>{meta?.emoji} {meta?.label ?? p.name}</span>
            <span style={{ fontWeight: 700 }}>{p.value.toFixed(1)}h</span>
          </div>
        )
      })}
    </div>
  )
}

export default function WeeklySummaryCard() {
  const { days, categories, avgSleepMins, totalHours } = useWeeklySummary()

  const hasData = days.some(d => categories.some(c => (d[c] as number) > 0))

  return (
    <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Last 7 Days
        </span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {avgSleepMins && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6366f1', fontWeight: 600 }}>
              <Moon size={12} />
              {formatDuration(avgSleepMins)} avg sleep
            </div>
          )}
          <span style={{ fontSize: '11px', color: '#6b6884' }}>{totalHours}h total</span>
        </div>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={days} margin={{ top: 8, right: 16, left: -12, bottom: 0 }} barSize={18}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b6884' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#6b6884' }} axisLine={false} tickLine={false} unit="h" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            {avgSleepMins && (
              <ReferenceLine
                y={avgSleepMins / 60}
                stroke="#6366f1"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: 'sleep avg', position: 'insideTopRight', fontSize: 9, fill: '#6366f1' }}
              />
            )}
            {categories.map((cat) => (
              <Bar key={cat} dataKey={cat} stackId="a" fill={ACTIVITY_META[cat].color} fillOpacity={0.85} radius={cat === categories[categories.length - 1] ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6b6884', fontSize: '13px' }}>
          Start tracking activities to see the weekly breakdown.
        </div>
      )}

      {/* Category legend */}
      {hasData && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '4px 16px 14px' }}>
          {categories.map((cat) => {
            const meta = ACTIVITY_META[cat]
            return (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#a09db8' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: meta.color }} />
                {meta.label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
