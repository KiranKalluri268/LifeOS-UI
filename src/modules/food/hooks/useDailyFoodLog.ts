import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import type { FoodLog, MealType } from '@/db/types'

const TODAY = new Date().toISOString().slice(0, 10)

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'other']

export interface FoodLogGroup {
  mealType: MealType
  entries: FoodLog[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export interface DailyFoodSummary {
  groups: FoodLogGroup[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  entryCount: number
  isLoading: boolean
}

/**
 * Live query — re-renders automatically whenever food_logs changes for today.
 * Groups entries by meal type in chronological meal order.
 */
export function useDailyFoodLog(): DailyFoodSummary {
  const logs = useLiveQuery(
    () => db.food_logs.where('[userId+date]').equals(['local', TODAY]).toArray(),
    [],
  )

  if (logs === undefined) {
    return {
      groups: [], totalCalories: 0, totalProtein: 0,
      totalCarbs: 0, totalFat: 0, entryCount: 0, isLoading: true,
    }
  }

  // Group by mealType
  const byMeal = new Map<MealType, FoodLog[]>()
  for (const log of logs) {
    const arr = byMeal.get(log.mealType) ?? []
    arr.push(log)
    byMeal.set(log.mealType, arr)
  }

  const groups: FoodLogGroup[] = MEAL_ORDER
    .filter((m) => byMeal.has(m))
    .map((mealType) => {
      const entries = byMeal.get(mealType)!
      return {
        mealType,
        entries,
        totalCalories: entries.reduce((s, e) => s + e.calories, 0),
        totalProtein:  Math.round(entries.reduce((s, e) => s + e.protein, 0) * 10) / 10,
        totalCarbs:    Math.round(entries.reduce((s, e) => s + e.carbs, 0) * 10) / 10,
        totalFat:      Math.round(entries.reduce((s, e) => s + e.fat, 0) * 10) / 10,
      }
    })

  return {
    groups,
    totalCalories: logs.reduce((s, e) => s + e.calories, 0),
    totalProtein:  Math.round(logs.reduce((s, e) => s + e.protein, 0) * 10) / 10,
    totalCarbs:    Math.round(logs.reduce((s, e) => s + e.carbs, 0) * 10) / 10,
    totalFat:      Math.round(logs.reduce((s, e) => s + e.fat, 0) * 10) / 10,
    entryCount: logs.length,
    isLoading: false,
  }
}
