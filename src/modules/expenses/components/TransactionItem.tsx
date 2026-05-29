import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { db } from '@/db'
import type { Transaction, Category } from '@/db/types'
import { CategoryIcon } from './CategoryPicker'
import { formatINR } from '../expense.types'

interface TransactionItemProps {
  transaction: Transaction
  category: Category | undefined
}

export default function TransactionItem({ transaction: t, category }: TransactionItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!t.id) return
    setIsDeleting(true)
    try {
      await db.transactions.delete(t.id)
    } catch (err) {
      console.error('Delete failed:', err)
      setIsDeleting(false)
    }
  }

  const isIncome = t.type === 'income'
  const amountColor = isIncome ? '#10b981' : '#ef4444'
  const catColor = category?.color ?? '#6b7280'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        opacity: isDeleting ? 0.4 : 1,
        transition: 'opacity 0.25s ease',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Category icon badge */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: `${catColor}18`,
          border: `1px solid ${catColor}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {category
          ? <CategoryIcon name={category.icon} size={18} color={catColor} />
          : <span style={{ fontSize: '16px' }}>?</span>
        }
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#f1f0f7',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {t.note || category?.name || 'Transaction'}
        </div>
        <div style={{ fontSize: '12px', color: '#6b6884', marginTop: '2px' }}>
          {category?.name ?? '—'}
          {t.note && category?.name ? ` · ${category.name}` : ''}
        </div>
      </div>

      {/* Amount */}
      <div
        style={{
          fontSize: '15px',
          fontWeight: 700,
          color: amountColor,
          flexShrink: 0,
          marginRight: '4px',
        }}
      >
        {isIncome ? '+' : '−'}{formatINR(t.amount)}
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Delete transaction"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#6b6884',
          padding: '4px',
          display: 'flex',
          borderRadius: '8px',
          transition: 'color 0.15s, background 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.color = '#ef4444'
          ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.color = '#6b6884'
          ;(e.currentTarget as HTMLElement).style.background = 'none'
        }}
      >
        <Trash2 size={15} strokeWidth={2} />
      </button>
    </div>
  )
}
