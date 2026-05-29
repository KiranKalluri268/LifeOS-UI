import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { InsightCard as InsightCardType } from '../insights.types'

interface InsightCardProps {
  card: InsightCardType
}

function TrendIcon({ trend, color }: { trend: InsightCardType['trend']; color: string }) {
  if (trend === 'positive') return <TrendingUp size={14} color={color} strokeWidth={2.5} />
  if (trend === 'negative') return <TrendingDown size={14} color="#ef4444" strokeWidth={2.5} />
  if (trend === 'neutral')  return <Minus size={14} color="#f59e0b" strokeWidth={2.5} />
  return null
}

export default function InsightCard({ card }: InsightCardProps) {
  const { emoji, title, metric, metricLabel, description, trend, color, sparkData, insufficient } = card

  const trendBg = trend === 'positive' ? 'rgba(16,185,129,0.08)'
                : trend === 'negative' ? 'rgba(239,68,68,0.08)'
                : trend === 'neutral'  ? 'rgba(245,158,11,0.08)'
                : 'transparent'

  return (
    <div
      style={{
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${color}20`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Card header */}
      <div style={{ padding: '14px 14px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: `${color}18`, border: `1px solid ${color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', flexShrink: 0,
            }}
          >
            {emoji}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {title}
            </div>
          </div>
        </div>

        {trend !== 'none' && (
          <div
            style={{
              padding: '3px 7px', borderRadius: '999px',
              background: trendBg,
              display: 'flex', alignItems: 'center', gap: '3px',
              flexShrink: 0,
            }}
          >
            <TrendIcon trend={trend} color={color} />
          </div>
        )}
      </div>

      {/* Metric */}
      <div style={{ padding: '10px 14px 4px' }}>
        <div style={{ fontSize: '26px', fontWeight: 800, color: insufficient ? '#3a3854' : color, lineHeight: 1 }}>
          {insufficient ? '—' : metric}
        </div>
        <div style={{ fontSize: '11px', color: '#6b6884', marginTop: '3px' }}>
          {metricLabel}
        </div>
      </div>

      {/* Sparkline */}
      {!insufficient && sparkData.some(p => p.value > 0) ? (
        <div style={{ height: '56px', margin: '4px 0 0' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div style={{ background: '#1e1e2a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', color: '#f1f0f7' }}>
                      {payload[0].payload.label}: <strong style={{ color }}>{typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}</strong>
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#grad-${card.id})`}
                dot={false}
                isAnimationActive
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ height: '20px' }} />
      )}

      {/* Description */}
      <div style={{ padding: '4px 14px 14px' }}>
        <div style={{ fontSize: '12px', color: insufficient ? '#4a4869' : '#a09db8', lineHeight: 1.5 }}>
          {description}
        </div>
      </div>
    </div>
  )
}
