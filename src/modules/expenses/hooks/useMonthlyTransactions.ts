import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import type { Transaction } from '@/db/types'
import type { MonthlyTotals } from '../expense.types'

export interface TransactionGroup {
  date: string
  /** Net for that day (income - expense) */
  dayNet: number
  transactions: Transaction[]
}

export interface MonthlyTransactionSummary {
  groups: TransactionGroup[]
  totals: MonthlyTotals
  entryCount: number
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7) // YYYY-MM
}

export function useMonthlyTransactions(): MonthlyTransactionSummary {
  const month = currentMonth()

  const transactions = useLiveQuery(
    () =>
      db.transactions
        .where('date')
        .startsWith(month)
        .reverse()
        .sortBy('date'),
    [month],
    []
  )

  return useMemo(() => {
    const byDate = new Map<string, Transaction[]>()
    const byCategory: Record<number, number> = {}
    let totalIncome = 0
    let totalExpense = 0

    for (const t of transactions) {
      // Group by date
      if (!byDate.has(t.date)) byDate.set(t.date, [])
      byDate.get(t.date)!.push(t)

      // Totals
      if (t.type === 'income') {
        totalIncome += t.amount
      } else {
        totalExpense += t.amount
        byCategory[t.categoryId] = (byCategory[t.categoryId] ?? 0) + t.amount
      }
    }

    // Sort dates descending
    const sortedDates = [...byDate.keys()].sort((a, b) => b.localeCompare(a))

    const groups: TransactionGroup[] = sortedDates.map((date) => {
      const dayTxs = byDate.get(date)!
      const dayNet = dayTxs.reduce(
        (acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount),
        0
      )
      return { date, dayNet, transactions: dayTxs }
    })

    return {
      groups,
      totals: { totalIncome, totalExpense, net: totalIncome - totalExpense, byCategory },
      entryCount: transactions.length,
    }
  }, [transactions])
}
