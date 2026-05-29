import { useState } from 'react'
import { Target, Check, PlusCircle } from 'lucide-react'
import BottomSheet from '@/components/BottomSheet'
import { CategoryIcon } from './CategoryPicker'
import { useCategories } from '../hooks/useCategories'
import { useMonthlyBudgets } from '../hooks/useMonthlyBudgets'
import { formatINR } from '../expense.types'
import { db } from '@/db'

interface BudgetSheetProps {
  isOpen: boolean
  onClose: () => void
  /** Actual spend per category this month */
  spentByCategory: Record<number, number>
}

function progressColor(p: number): string {
  if (p >= 1) return '#ef4444'
  if (p >= 0.8) return '#f59e0b'
  return '#10b981'
}

interface EditingBudget {
  categoryId: number
  value: string
  existingId?: number
}

export default function BudgetSheet({ isOpen, onClose, spentByCategory }: BudgetSheetProps) {
  const categories = useCategories()
  const budgetRows = useMonthlyBudgets(spentByCategory)
  const [editing, setEditing] = useState<EditingBudget | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const budgetedCatIds = new Set(budgetRows.map((r) => r.budget.categoryId))
  const unbudgetedCats = categories.filter((c) => c.id != null && !budgetedCatIds.has(c.id!))

  const currentMonth = new Date().toISOString().slice(0, 7)

  const handleSaveBudget = async () => {
    if (!editing) return
    const amount = parseFloat(editing.value)
    if (!amount || amount <= 0) return
    setIsSaving(true)
    try {
      const now = new Date().toISOString()
      if (editing.existingId) {
        await db.budgets.update(editing.existingId, { amount, updatedAt: now })
      } else {
        await db.budgets.add({
          userId: 'local',
          categoryId: editing.categoryId,
          month: currentMonth,
          amount,
          createdAt: now,
          updatedAt: now,
        })
      }
      setEditing(null)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Monthly Budgets" accentColor="#10b981">
      <div style={{ padding: '16px 20px 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Existing budgets */}
        {budgetRows.length === 0 && unbudgetedCats.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b6884', fontSize: '14px' }}>
            No categories available. Add categories first.
          </div>
        )}

        {budgetRows.map(({ budget, category, spent, progress }) => {
          const color = progressColor(progress)
          const isEditingThis = editing?.categoryId === category.id

          return (
            <div
              key={budget.id}
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div
                  style={{
                    width: '34px', height: '34px', borderRadius: '10px',
                    background: `${category.color}18`, border: `1px solid ${category.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <CategoryIcon name={category.icon} size={16} color={category.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f0f7' }}>{category.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b6884' }}>
                    {formatINR(spent)} of {formatINR(budget.amount)}
                  </div>
                </div>
                <button
                  onClick={() =>
                    setEditing(
                      isEditingThis
                        ? null
                        : { categoryId: category.id!, value: String(budget.amount), existingId: budget.id }
                    )
                  }
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600, color: '#10b981', fontFamily: 'inherit',
                  }}
                >
                  {isEditingThis ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {/* Progress bar */}
              <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round(progress * 100)}%`,
                    borderRadius: '999px',
                    background: color,
                    transition: 'width 0.5s ease, background 0.3s',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                <span style={{ fontSize: '11px', color }}>
                  {Math.round(progress * 100)}% used
                </span>
                <span style={{ fontSize: '11px', color: '#6b6884' }}>
                  {formatINR(Math.max(0, budget.amount - spent))} remaining
                </span>
              </div>

              {/* Inline edit */}
              {isEditingThis && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, padding: '0 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ color: '#10b981', fontWeight: 700, fontSize: '16px' }}>₹</span>
                    <input
                      type="number"
                      placeholder="Budget amount"
                      value={editing!.value}
                      onChange={(e) => setEditing((prev) => prev ? { ...prev, value: e.target.value } : null)}
                      style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f1f0f7', fontSize: '15px', fontFamily: 'inherit', padding: '10px 0' }}
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleSaveBudget}
                    disabled={isSaving}
                    style={{
                      padding: '0 16px', borderRadius: '10px', background: '#10b981', border: 'none',
                      color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                    }}
                  >
                    <Check size={16} />
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Un-budgeted categories — quick add */}
        {unbudgetedCats.length > 0 && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
              Add Budget
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {unbudgetedCats.map((cat) => {
                const isEditingThis = editing?.categoryId === cat.id
                return (
                  <div
                    key={cat.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: `${cat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CategoryIcon name={cat.icon} size={15} color={cat.color} />
                      </div>
                      <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#a09db8' }}>{cat.name}</span>
                      {!isEditingThis && (
                        <button
                          onClick={() => setEditing({ categoryId: cat.id!, value: '' })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}
                        >
                          <PlusCircle size={14} /> Set budget
                        </button>
                      )}
                    </div>

                    {isEditingThis && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, padding: '0 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <span style={{ color: '#10b981', fontWeight: 700, fontSize: '16px' }}>₹</span>
                          <input
                            type="number"
                            placeholder="Budget amount"
                            value={editing!.value}
                            onChange={(e) => setEditing((prev) => prev ? { ...prev, value: e.target.value } : null)}
                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f1f0f7', fontSize: '15px', fontFamily: 'inherit', padding: '10px 0' }}
                            autoFocus
                          />
                        </div>
                        <button
                          onClick={handleSaveBudget}
                          disabled={isSaving}
                          style={{ padding: '0 16px', borderRadius: '10px', background: '#10b981', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          style={{ padding: '0 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#a09db8', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Summary tip when all budgeted */}
        {budgetRows.length > 0 && unbudgetedCats.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <Target size={16} color="#10b981" />
            <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>All categories have a budget set</span>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
