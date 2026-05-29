import type { TransactionType } from '@/db/types'

// ── Entry form draft ──────────────────────────────────────────────────────────

export interface ExpenseEntryDraft {
  type: TransactionType
  /** Always positive */
  amount: string
  categoryId: number | null
  note: string
  /** YYYY-MM-DD */
  date: string
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export const EMPTY_DRAFT: ExpenseEntryDraft = {
  type: 'expense',
  amount: '',
  categoryId: null,
  note: '',
  date: todayStr(),
}

// ── Monthly summary ───────────────────────────────────────────────────────────

export interface MonthlyTotals {
  totalIncome: number
  totalExpense: number
  /** net = income - expense */
  net: number
  /** Spend keyed by categoryId */
  byCategory: Record<number, number>
}

// ── Currency helpers ──────────────────────────────────────────────────────────

/** Format a positive number as ₹1,23,456 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export type { TransactionType }
