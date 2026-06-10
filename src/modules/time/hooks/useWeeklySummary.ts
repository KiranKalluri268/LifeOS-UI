import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { daysAgoStr, todayStr, ACTIVITY_CATEGORIES } from '../time.types'
import type { ActivityCategory } from '@/db/types'

export interface WeekDayData {
  date: string
  /** Short label e.g. "Mon" */
  label: string
  /** Hours (decimal) per category */
  [key: string]: number | string
}

export interface WeeklySummary {
  days: WeekDayData[]
  categories: ActivityCategory[]
  /** Average sleep duration in minutes over the week (null if no data) */
  avgSleepMins: number | null
  /** Total hours tracked across entire week */
  totalHours: number
}

export function useWeeklySummary(): WeeklySummary {
  const startDate = daysAgoStr(6)
  const endDate   = todayStr()

  const activityLogs = useLiveQuery(
    () =>
      db.activity_logs
        .where('date')
        .between(startDate, endDate, true, true)
        .toArray(),
    [startDate, endDate],
    [] as import('@/db/types').ActivityLog[]
  )

  const sleepLogs = useLiveQuery(
    () =>
      db.sleep_logs
        .where('date')
        .between(startDate, endDate, true, true)
        .toArray(),
    [startDate, endDate],
    [] as import('@/db/types').SleepLog[]
  )

  return useMemo(() => {
    // Build a map of date → category → total minutes
    const dayMap = new Map<string, Record<string, number>>()
    for (let i = 6; i >= 0; i--) {
      const d = daysAgoStr(i)
      dayMap.set(d, {})
    }

    let grandTotalMins = 0
    for (const log of activityLogs) {
      if (!dayMap.has(log.date)) continue
      const day = dayMap.get(log.date)!
      day[log.category] = (day[log.category] ?? 0) + log.durationMins
      grandTotalMins += log.durationMins
    }

    // Sleep average
    const sleepTotalMins = sleepLogs.reduce<number>((acc, s) => acc + s.durationMins, 0)
    const avgSleepMins = sleepLogs.length > 0 ? Math.round(sleepTotalMins / sleepLogs.length) : null

    const days: WeekDayData[] = []
    for (const [date, catMins] of dayMap) {
      const d = new Date(date + 'T00:00:00')
      const label = d.toLocaleDateString('en-IN', { weekday: 'short' })
      const entry: WeekDayData = { date, label }
      for (const cat of ACTIVITY_CATEGORIES) {
        entry[cat] = Math.round(((catMins[cat] ?? 0) / 60) * 10) / 10 // hours, 1dp
      }
      days.push(entry)
    }

    // Find categories that have any data this week
    const activeCategories = ACTIVITY_CATEGORIES.filter((cat) =>
      days.some((d) => (d[cat] as number) > 0)
    )

    return {
      days,
      categories: activeCategories.length > 0 ? activeCategories : ACTIVITY_CATEGORIES,
      avgSleepMins,
      totalHours: Math.round((grandTotalMins / 60) * 10) / 10,
    }
  }, [activityLogs, sleepLogs])
}
