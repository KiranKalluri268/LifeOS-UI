import { Coffee, Sun, Sunset, Apple, MoreHorizontal } from 'lucide-react'
import FoodLogItem from './FoodLogItem'
import type { FoodLogGroup } from '../hooks/useDailyFoodLog'
import type { MealType } from '@/db/types'

const MEAL_META: Record<MealType, { label: string; icon: React.ElementType; color: string }> = {
  breakfast: { label: 'Breakfast', icon: Coffee,        color: '#f59e0b' },
  lunch:     { label: 'Lunch',     icon: Sun,           color: '#f97316' },
  dinner:    { label: 'Dinner',    icon: Sunset,        color: '#8b5cf6' },
  snack:     { label: 'Snack',     icon: Apple,         color: '#10b981' },
  other:     { label: 'Other',     icon: MoreHorizontal,color: '#6b7280' },
}

interface FoodLogListProps {
  groups: FoodLogGroup[]
  totalCalories: number
  entryCount: number
}

export default function FoodLogList({ groups, totalCalories, entryCount }: FoodLogListProps) {
  if (entryCount === 0) {
    return (
      <div
        style={{
          padding: '48px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '48px' }}>🍽️</span>
        <p style={{ fontSize: '17px', fontWeight: 700, color: '#f1f0f7' }}>Nothing logged yet</p>
        <p style={{ fontSize: '13px', color: '#6b6884', lineHeight: 1.5, maxWidth: '200px' }}>
          Tap <strong style={{ color: '#f97316' }}>+</strong> to log food or{' '}
          <strong style={{ color: '#3b82f6' }}>💧</strong> for a drink
        </p>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '8px' }}>
      {/* Daily total header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px 10px',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Today · {entryCount} item{entryCount !== 1 ? 's' : ''}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#f97316' }}>
          {totalCalories} kcal total
        </span>
      </div>

      {/* Grouped sections */}
      {groups.map((group) => {
        const meta = MEAL_META[group.mealType]
        const Icon = meta.icon
        return (
          <div
            key={group.mealType}
            style={{
              marginBottom: '4px',
              borderRadius: '12px',
              overflow: 'hidden',
              margin: '0 12px 8px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {/* Group header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: `${meta.color}0a`,
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Icon size={13} color={meta.color} strokeWidth={2} />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: meta.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {meta.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#6b6884' }}>
                  P {group.totalProtein}g · C {group.totalCarbs}g · F {group.totalFat}g
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: meta.color }}>
                  {group.totalCalories} kcal
                </span>
              </div>
            </div>

            {/* Entries */}
            {group.entries.map((entry) => (
              <FoodLogItem key={entry.id} entry={entry} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
