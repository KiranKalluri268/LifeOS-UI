import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { FoodLog } from '@/db/types'
import { db } from '@/db'

function MacroChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span
      style={{
        fontSize: '10px',
        color,
        background: `${color}18`,
        padding: '2px 5px',
        borderRadius: '4px',
        fontWeight: 500,
      }}
    >
      {label} {value}g
    </span>
  )
}

interface FoodLogItemProps {
  entry: FoodLog
}

export default function FoodLogItem({ entry }: FoodLogItemProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (entry.id === undefined) return
    setDeleting(true)
    try {
      await db.food_logs.delete(entry.id)
      // Live query in useDailyFoodLog will auto-remove this item
    } catch (err) {
      console.error('Failed to delete food log:', err)
      setDeleting(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '11px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        opacity: deleting ? 0.4 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#f1f0f7',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {entry.foodName}
          </p>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#f97316', flexShrink: 0 }}>
            {entry.calories} kcal
          </span>
        </div>

        {/* Meta row: brand · amount · macros */}
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
          {entry.brand && (
            <>
              <span style={{ fontSize: '10px', color: '#6b6884' }}>{entry.brand}</span>
              <span style={{ fontSize: '10px', color: '#3a3852' }}>·</span>
            </>
          )}
          <span style={{ fontSize: '10px', color: '#6b6884' }}>
            {entry.servingSize}{entry.servingUnit}
          </span>
          <span style={{ fontSize: '10px', color: '#3a3852' }}>·</span>
          <MacroChip label="P" value={entry.protein} color="#3b82f6" />
          <MacroChip label="C" value={entry.carbs}   color="#10b981" />
          <MacroChip label="F" value={entry.fat}     color="#f59e0b" />
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        aria-label={`Delete ${entry.foodName}`}
        style={{
          background: 'none',
          border: 'none',
          cursor: deleting ? 'not-allowed' : 'pointer',
          padding: '6px',
          color: '#3a3852',
          display: 'flex',
          flexShrink: 0,
          transition: 'color 0.15s ease',
          borderRadius: '6px',
        }}
        onMouseEnter={(e) => { if (!deleting) (e.currentTarget as HTMLElement).style.color = '#ef4444' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#3a3852' }}
      >
        <Trash2 size={15} strokeWidth={1.5} />
      </button>
    </div>
  )
}
