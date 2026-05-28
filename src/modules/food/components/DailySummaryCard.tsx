import { useMemo } from 'react'
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from 'recharts'
import HydrationBar from './HydrationBar'
import type { DailyFoodSummary } from '../hooks/useDailyFoodLog'
import type { DailyLiquidSummary } from '../hooks/useDailyLiquids'

// Hardcoded defaults — editable in Settings (Phase 5)
const GOALS = { calories: 2000, protein: 150, carbs: 250, fat: 65 } as const

function pct(value: number, goal: number) {
  return Math.min(100, Math.round((value / goal) * 100))
}

function calColor(p: number) {
  if (p >= 100) return '#ef4444'
  if (p >= 80)  return '#f59e0b'
  return '#f97316'
}

interface DailySummaryCardProps {
  foodSummary: DailyFoodSummary
  liquidSummary: DailyLiquidSummary
  onAddLiquid: () => void
}

const MACRO_META = [
  { key: 'protein' as const, label: 'Protein', color: '#3b82f6', unit: 'g', goal: GOALS.protein },
  { key: 'carbs'   as const, label: 'Carbs',   color: '#10b981', unit: 'g', goal: GOALS.carbs   },
  { key: 'fat'     as const, label: 'Fat',     color: '#f59e0b', unit: 'g', goal: GOALS.fat     },
]

export default function DailySummaryCard({
  foodSummary,
  liquidSummary,
  onAddLiquid,
}: DailySummaryCardProps) {
  const { totalCalories, totalProtein, totalCarbs, totalFat } = foodSummary

  const calPct  = pct(totalCalories, GOALS.calories)
  const accColor = calColor(calPct)

  // Data for Recharts — innermost first (fat), outermost last (calories)
  const chartData = useMemo(() => [
    { name: 'fat',      value: pct(totalFat,      GOALS.fat),      fill: '#f59e0b' },
    { name: 'carbs',    value: pct(totalCarbs,    GOALS.carbs),    fill: '#10b981' },
    { name: 'protein',  value: pct(totalProtein,  GOALS.protein),  fill: '#3b82f6' },
    { name: 'calories', value: calPct,                              fill: accColor  },
  ], [totalFat, totalCarbs, totalProtein, calPct, accColor])

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'short',
  })

  const macroValues: Record<string, number> = {
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
  }

  return (
    <div
      style={{
        margin: '0 0 0 0',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px 4px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#6b6884',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}
        >
          Today
        </span>
        <span style={{ fontSize: '11px', color: '#6b6884' }}>{today}</span>
      </div>

      {/* Radial chart + calorie centre */}
      <div style={{ position: 'relative', height: '180px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="32%"
            outerRadius="90%"
            data={chartData}
            startAngle={90}
            endAngle={-270}
            barSize={10}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: 'rgba(255,255,255,0.04)' }}
              dataKey="value"
              cornerRadius={5}
              isAnimationActive
              animationBegin={0}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Calorie overlay — centre of chart */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: accColor,
              lineHeight: 1,
              transition: 'color 0.4s ease',
            }}
          >
            {totalCalories.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: '#6b6884', marginTop: '3px' }}>
            / {GOALS.calories} kcal
          </div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: accColor,
              opacity: 0.8,
              marginTop: '2px',
            }}
          >
            {calPct}%
          </div>
        </div>
      </div>

      {/* Macro breakdown row */}
      <div
        style={{
          display: 'flex',
          padding: '0 12px 14px',
          gap: '8px',
        }}
      >
        {MACRO_META.map(({ key, label, color, unit, goal }) => {
          const val = macroValues[key] ?? 0
          const p = pct(val, goal)
          return (
            <div
              key={key}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: '10px',
                background: `${color}0d`,
                border: `1px solid ${color}22`,
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f0f7' }}>
                {val}{unit}
              </div>
              <div style={{ fontSize: '10px', color: '#6b6884' }}>
                / {goal}{unit}
              </div>
              {/* Mini progress bar */}
              <div
                style={{
                  marginTop: '6px',
                  height: '3px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${p}%`,
                    borderRadius: '999px',
                    background: color,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Hydration bar (integrated into card) */}
      <div
        style={{
          padding: '0 12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          paddingTop: '12px',
        }}
      >
        <HydrationBar summary={liquidSummary} onAdd={onAddLiquid} />
      </div>
    </div>
  )
}
