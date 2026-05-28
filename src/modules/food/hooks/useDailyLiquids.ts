import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'

const TODAY = new Date().toISOString().slice(0, 10)
const WATER_TARGET_ML = 2500

export interface DailyLiquidSummary {
  totalMl: number
  targetMl: number
  percentageRaw: number   // 0–∞ (can exceed 100)
  percentage: number      // capped at 100 for progress bar
  isLoading: boolean
  byType: Record<string, number>
}

/**
 * Live query — reacts to any insert/delete in liquid_logs for today.
 * Returns aggregated ml totals and progress toward daily target.
 */
export function useDailyLiquids(): DailyLiquidSummary {
  const logs = useLiveQuery(
    () => db.liquid_logs.where('[userId+date]').equals(['local', TODAY]).toArray(),
    [],
  )

  if (logs === undefined) {
    return { totalMl: 0, targetMl: WATER_TARGET_ML, percentageRaw: 0, percentage: 0, isLoading: true, byType: {} }
  }

  const byType: Record<string, number> = {}
  let totalMl = 0

  for (const log of logs) {
    totalMl += log.amountMl
    byType[log.liquidType] = (byType[log.liquidType] ?? 0) + log.amountMl
  }

  const percentageRaw = (totalMl / WATER_TARGET_ML) * 100
  return {
    totalMl,
    targetMl: WATER_TARGET_ML,
    percentageRaw,
    percentage: Math.min(100, percentageRaw),
    isLoading: false,
    byType,
  }
}
