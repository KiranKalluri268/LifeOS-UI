import { Wallet } from 'lucide-react'
import TransactionItem from './TransactionItem'
import type { TransactionGroup } from '../hooks/useMonthlyTransactions'
import type { Category } from '@/db/types'
import { formatINR } from '../expense.types'

interface TransactionListProps {
  groups: TransactionGroup[]
  entryCount: number
  categoryMap: Map<number, Category>
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (dateStr === today.toISOString().slice(0, 10)) return 'Today'
  if (dateStr === yesterday.toISOString().slice(0, 10)) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function TransactionList({ groups, entryCount, categoryMap }: TransactionListProps) {
  if (entryCount === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 32px',
          gap: '12px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Wallet size={28} color="#10b981" strokeWidth={1.5} />
        </div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#f1f0f7' }}>No transactions yet</div>
        <div style={{ fontSize: '13px', color: '#6b6884', maxWidth: '220px', lineHeight: 1.5 }}>
          Tap the <strong style={{ color: '#10b981' }}>+</strong> button to log your first income or expense.
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '100px' }}>
      {groups.map((group) => {
        const isPositive = group.dayNet >= 0
        return (
          <div key={group.date}>
            {/* Date header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px 8px',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6b6884',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {formatDate(group.date)}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isPositive ? '#10b981' : '#ef4444',
                }}
              >
                {isPositive ? '+' : ''}{formatINR(group.dayNet)}
              </span>
            </div>

            {/* Transaction rows */}
            <div
              style={{
                margin: '0 16px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}
            >
              {group.transactions.map((t) => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  category={t.categoryId != null ? categoryMap.get(t.categoryId) : undefined}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
