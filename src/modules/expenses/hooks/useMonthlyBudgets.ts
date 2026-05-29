import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import type { Budget, Category } from '@/db/types'

export interface BudgetRow {
  budget: Budget
  category: Category
  /** Amount spent this month in this category */
  spent: number
  /** spent / budget.amount capped at 1 */
  progress: number
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export function useMonthlyBudgets(
  spentByCategory: Record<number, number>
): BudgetRow[] {
  const month = currentMonth()

  const budgets = useLiveQuery(
    () => db.budgets.where('month').equals(month).toArray(),
    [month],
    []
  )

  const categories = useLiveQuery(
    () => db.categories.toArray(),
    [],
    []
  )

  return useMemo(() => {
    const catMap = new Map(categories.map((c) => [c.id!, c]))

    return budgets
      .filter((b) => catMap.has(b.categoryId))
      .map((b) => {
        const category = catMap.get(b.categoryId)!
        const spent = spentByCategory[b.categoryId] ?? 0
        const progress = b.amount > 0 ? Math.min(1, spent / b.amount) : 0
        return { budget: b, category, spent, progress }
      })
      .sort((a, b) => b.progress - a.progress) // most-spent first
  }, [budgets, categories, spentByCategory])
}
