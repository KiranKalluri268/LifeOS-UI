import { Coffee, Sun, Sunset, Apple, MoreHorizontal } from 'lucide-react'
import type { MealType } from '../food.types'

interface MealOption {
  value: MealType
  label: string
  icon: React.ElementType
  color: string
}

const MEAL_OPTIONS: MealOption[] = [
  { value: 'breakfast', label: 'Breakfast', icon: Coffee,        color: '#f59e0b' },
  { value: 'lunch',     label: 'Lunch',     icon: Sun,           color: '#f97316' },
  { value: 'dinner',    label: 'Dinner',    icon: Sunset,        color: '#8b5cf6' },
  { value: 'snack',     label: 'Snack',     icon: Apple,         color: '#10b981' },
  { value: 'other',     label: 'Other',     icon: MoreHorizontal,color: '#6b7280' },
]

// Auto-select meal type based on current time
export function getDefaultMealType(): MealType {
  const hour = new Date().getHours()
  if (hour >= 5  && hour < 10) return 'breakfast'
  if (hour >= 10 && hour < 15) return 'lunch'
  if (hour >= 15 && hour < 18) return 'snack'
  if (hour >= 18 && hour < 22) return 'dinner'
  return 'other'
}

interface MealTypeSelectorProps {
  value: MealType
  onChange: (value: MealType) => void
}

export default function MealTypeSelector({ value, onChange }: MealTypeSelectorProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '2px 0 4px',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {MEAL_OPTIONS.map((opt) => {
        const Icon = opt.icon
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '999px',
              border: `1.5px solid ${isActive ? opt.color : 'rgba(255,255,255,0.08)'}`,
              background: isActive ? `${opt.color}20` : 'transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s ease',
              fontFamily: 'inherit',
            }}
          >
            <Icon
              size={14}
              color={isActive ? opt.color : '#6b6884'}
              strokeWidth={2}
            />
            <span
              style={{
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? opt.color : '#a09db8',
              }}
            >
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
