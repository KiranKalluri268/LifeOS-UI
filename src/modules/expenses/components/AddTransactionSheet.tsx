import { useState, useCallback } from 'react'
import { Check, TrendingUp, TrendingDown } from 'lucide-react'
import BottomSheet from '@/components/BottomSheet'
import CategoryPicker from './CategoryPicker'
import { useCategories } from '../hooks/useCategories'
import { EMPTY_DRAFT, todayStr, formatINR, type ExpenseEntryDraft } from '../expense.types'
import { db } from '@/db'

interface AddTransactionSheetProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

export default function AddTransactionSheet({ isOpen, onClose, onSaved }: AddTransactionSheetProps) {
  const categories = useCategories()
  const [draft, setDraft] = useState<ExpenseEntryDraft>(EMPTY_DRAFT)
  const [isSaving, setIsSaving] = useState(false)

  const set = (updates: Partial<ExpenseEntryDraft>) =>
    setDraft((prev) => ({ ...prev, ...updates }))

  const handleClose = useCallback(() => {
    onClose()
    setTimeout(() => setDraft({ ...EMPTY_DRAFT, date: todayStr() }), 400)
  }, [onClose])

  const parsedAmount = parseFloat(draft.amount) || 0
  const canSave = parsedAmount > 0 && draft.categoryId != null

  const handleSave = async () => {
    if (!canSave) return
    setIsSaving(true)
    try {
      const now = new Date().toISOString()
      await db.transactions.add({
        userId: 'local',
        date: draft.date,
        type: draft.type,
        amount: parsedAmount,
        categoryId: draft.categoryId!,
        note: draft.note.trim() || undefined,
        syncStatus: 'pending',
        createdAt: now,
        updatedAt: now,
      })
      onSaved()
      handleClose()
    } catch (err) {
      console.error('Failed to save transaction:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const isExpense = draft.type === 'expense'
  const accentColor = isExpense ? '#ef4444' : '#10b981'

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Log Transaction"
      accentColor={accentColor}
    >
      <div style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Income / Expense Toggle ─────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
            padding: '4px',
            gap: '4px',
          }}
        >
          {(['expense', 'income'] as const).map((t) => {
            const active = draft.type === t
            const color = t === 'expense' ? '#ef4444' : '#10b981'
            return (
              <button
                key={t}
                type="button"
                onClick={() => set({ type: t })}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '9px',
                  border: 'none',
                  background: active ? `${color}20` : 'transparent',
                  color: active ? color : '#6b6884',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  outline: active ? `1.5px solid ${color}40` : 'none',
                }}
              >
                {t === 'expense'
                  ? <TrendingDown size={16} strokeWidth={2.5} />
                  : <TrendingUp size={16} strokeWidth={2.5} />}
                {t === 'expense' ? 'Expense' : 'Income'}
              </button>
            )
          })}
        </div>

        {/* ── Amount input ────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '16px 24px',
              borderRadius: '16px',
              background: `${accentColor}10`,
              border: `1.5px solid ${accentColor}30`,
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '28px', fontWeight: 800, color: accentColor, lineHeight: 1 }}>₹</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={draft.amount}
              onChange={(e) => set({ amount: e.target.value })}
              style={{
                width: '140px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '36px',
                fontWeight: 800,
                color: '#f1f0f7',
                textAlign: 'center',
                fontFamily: 'inherit',
              }}
            />
          </div>
          {parsedAmount > 0 && (
            <div style={{ fontSize: '12px', color: '#6b6884', marginTop: '6px' }}>
              {formatINR(parsedAmount)}
            </div>
          )}
        </div>

        {/* ── Category picker ─────────────────────────────────────────────── */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
            Category
          </div>
          <CategoryPicker
            categories={categories}
            selectedId={draft.categoryId}
            onChange={(id) => set({ categoryId: id })}
          />
        </div>

        {/* ── Note ────────────────────────────────────────────────────────── */}
        <input
          type="text"
          placeholder="Note (optional)"
          value={draft.note}
          onChange={(e) => set({ note: e.target.value })}
          style={{
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#f1f0f7',
            fontSize: '14px',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />

        {/* ── Date ────────────────────────────────────────────────────────── */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
            Date
          </div>
          <input
            type="date"
            value={draft.date}
            onChange={(e) => set({ date: e.target.value })}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#f1f0f7',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
              colorScheme: 'dark',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* ── Save ────────────────────────────────────────────────────────── */}
        <button
          onClick={handleSave}
          disabled={isSaving || !canSave}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            background: canSave
              ? `linear-gradient(135deg, ${accentColor}, ${isExpense ? '#dc2626' : '#059669'})`
              : 'rgba(255,255,255,0.06)',
            border: 'none',
            color: canSave ? '#fff' : '#6b6884',
            fontSize: '16px',
            fontWeight: 700,
            cursor: canSave ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
        >
          <Check size={18} strokeWidth={2.5} />
          {isSaving
            ? 'Saving…'
            : canSave
              ? `Save ${isExpense ? '−' : '+'}${formatINR(parsedAmount)}`
              : 'Enter amount & category'}
        </button>
      </div>
    </BottomSheet>
  )
}
