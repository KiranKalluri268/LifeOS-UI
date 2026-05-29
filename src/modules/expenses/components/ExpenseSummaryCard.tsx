import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import type { MonthlyTotals } from '../expense.types'
import type { Category } from '@/db/types'
import { formatINR } from '../expense.types'

interface ExpenseSummaryCardProps {
  totals: MonthlyTotals
  categoryMap: Map<number, Category>
}

interface ChartBarItem {
  name: string
  amount: number
  color: string
}

// Custom tooltip for the bar chart
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: ChartBarItem }> }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div
      style={{
        background: '#1e1e2a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '12px',
        color: '#f1f0f7',
      }}
    >
      <div style={{ fontWeight: 700, color: item.payload.color }}>{item.payload.name}</div>
      <div>{formatINR(item.value)}</div>
    </div>
  )
}

export default function ExpenseSummaryCard({ totals, categoryMap }: ExpenseSummaryCardProps) {
  const { totalIncome, totalExpense, net, byCategory } = totals

  // Build sorted chart data (top 6 expense categories)
  const chartData: ChartBarItem[] = useMemo(() => {
    return Object.entries(byCategory)
      .map(([catIdStr, amount]) => {
        const catId = parseInt(catIdStr, 10)
        const cat = categoryMap.get(catId)
        return {
          name: cat?.name ?? 'Other',
          amount,
          color: cat?.color ?? '#6b7280',
        }
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
  }, [byCategory, categoryMap])

  const topCategory = chartData[0]
  const month = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const isNetPositive = net >= 0

  return (
    <div
      style={{
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {month}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wallet size={14} color="#10b981" />
          <span style={{ fontSize: '11px', color: '#6b6884' }}>Monthly Summary</span>
        </div>
      </div>

      {/* Income / Expense / Net row */}
      <div style={{ display: 'flex', padding: '4px 12px 16px', gap: '8px' }}>
        {[
          { label: 'Income', value: totalIncome, color: '#10b981', Icon: TrendingUp },
          { label: 'Expense', value: totalExpense, color: '#ef4444', Icon: TrendingDown },
          { label: 'Net', value: Math.abs(net), color: isNetPositive ? '#10b981' : '#ef4444', Icon: isNetPositive ? TrendingUp : TrendingDown },
        ].map(({ label, value, color, Icon }) => (
          <div
            key={label}
            style={{
              flex: 1,
              padding: '10px 8px',
              borderRadius: '12px',
              background: `${color}0d`,
              border: `1px solid ${color}20`,
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Icon size={11} strokeWidth={2.5} /> {label}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#f1f0f7', lineHeight: 1 }}>
              {label === 'Net' && !isNetPositive ? '−' : ''}{formatINR(value)}
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      {chartData.length > 0 ? (
        <div>
          <div style={{ padding: '0 16px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Spend by category
            </span>
            {topCategory && (
              <span style={{ fontSize: '11px', color: topCategory.color, fontWeight: 600 }}>
                Top: {topCategory.name}
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }} barSize={20}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#6b6884' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ padding: '16px 16px 20px', textAlign: 'center', color: '#6b6884', fontSize: '13px' }}>
          Log some expenses to see the breakdown chart.
        </div>
      )}
    </div>
  )
}
