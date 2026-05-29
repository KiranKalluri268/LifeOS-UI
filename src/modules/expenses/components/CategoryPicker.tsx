import {
  UtensilsCrossed, Car, HeartPulse, Clapperboard,
  Zap, ShoppingBag, Briefcase, MoreHorizontal,
  TrendingUp, Home, Gamepad2, BookOpen,
  type LucideProps,
} from 'lucide-react'
import type { Category } from '@/db/types'

// Map of icon name → component (extend as you add custom categories)
const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  UtensilsCrossed,
  Car,
  HeartPulse,
  Clapperboard,
  Zap,
  ShoppingBag,
  Briefcase,
  MoreHorizontal,
  TrendingUp,
  Home,
  Gamepad2,
  BookOpen,
}

function CategoryIcon({ name, size = 18, color }: { name: string; size?: number; color: string }) {
  const Icon = ICON_MAP[name] ?? MoreHorizontal
  return <Icon size={size} color={color} strokeWidth={2} />
}

interface CategoryPickerProps {
  categories: Category[]
  selectedId: number | null
  onChange: (id: number) => void
}

export default function CategoryPicker({ categories, selectedId, onChange }: CategoryPickerProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
      }}
    >
      {categories.map((cat) => {
        const isSelected = cat.id === selectedId
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id!)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 6px',
              borderRadius: '12px',
              border: `1.5px solid ${isSelected ? cat.color : 'rgba(255,255,255,0.07)'}`,
              background: isSelected ? `${cat.color}18` : 'rgba(255,255,255,0.03)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: `${cat.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CategoryIcon name={cat.icon} size={18} color={cat.color} />
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? cat.color : '#a09db8',
                textAlign: 'center',
                lineHeight: 1.2,
                wordBreak: 'break-word',
              }}
            >
              {cat.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Re-exported for use in TransactionItem and lists */
export { CategoryIcon }
