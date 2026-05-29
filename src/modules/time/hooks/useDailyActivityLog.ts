import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { useLiveQuery as useLQ } from 'dexie-react-hooks'
import type { ActivityLog, SleepLog } from '@/db/types'
import { todayStr, formatDuration } from '../time.types'

export interface DailyActivitySummary {
  logs: ActivityLog[]
  sleepLog: SleepLog | null
  totalMins: number
  /** minutes per category */
  byCategory: Record<string, number>
  totalFormatted: string
}

export function useDailyActivityLog(date?: string): DailyActivitySummary {
  const day = date ?? todayStr()

  const logs = useLiveQuery(
    () => db.activity_logs.where('date').equals(day).toArray(),
    [day],
    []
  )

  const sleepLog = useLQ(
    () => db.sleep_logs.where('date').equals(day).first().then(r => r ?? null),
    [day],
    null
  ) ?? null

  return useMemo(() => {
    const byCategory: Record<string, number> = {}
    let totalMins = 0
    for (const log of logs) {
      byCategory[log.category] = (byCategory[log.category] ?? 0) + log.durationMins
      totalMins += log.durationMins
    }
    return {
      logs: logs.slice().sort((a, b) => a.startTime.localeCompare(b.startTime)),
      sleepLog,
      totalMins,
      byCategory,
      totalFormatted: formatDuration(totalMins),
    }
  }, [logs, sleepLog])
}
