import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import type { ActiveTimer, ActivityCategory } from '@/db/types'
import { todayStr, diffMins } from '../time.types'

export type { ActiveTimer }

export interface UseActiveTimerReturn {
  timer: ActiveTimer | null
  isRunning: boolean
  start: (category: ActivityCategory, note?: string) => Promise<void>
  stop: () => Promise<void>
}

export function useActiveTimer(): UseActiveTimerReturn {
  const timer = useLiveQuery(
    () => db.active_timer.where('userId').equals('local').first(),
    [],
    null
  ) ?? null

  const start = async (category: ActivityCategory, note?: string) => {
    // Stop any existing timer first
    const existing = await db.active_timer.where('userId').equals('local').first()
    if (existing?.id) {
      await _commitTimer(existing)
    }
    await db.active_timer.add({
      userId: 'local',
      category,
      startTime: new Date().toISOString(),
      note: note?.trim() || undefined,
      createdAt: new Date().toISOString(),
    })
  }

  const stop = async () => {
    const existing = await db.active_timer.where('userId').equals('local').first()
    if (!existing) return
    await _commitTimer(existing)
  }

  return { timer, isRunning: timer !== null, start, stop }
}

/** Save the timer as an ActivityLog and delete it from active_timer */
async function _commitTimer(timer: ActiveTimer): Promise<void> {
  const endTime = new Date().toISOString()
  const duration = diffMins(timer.startTime, endTime)
  // Only save if at least 1 minute elapsed
  if (duration >= 1) {
    const now = new Date().toISOString()
    await db.activity_logs.add({
      userId: 'local',
      date: todayStr(),
      category: timer.category,
      startTime: timer.startTime,
      endTime,
      durationMins: duration,
      note: timer.note,
      syncStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    })
  }
  if (timer.id != null) {
    await db.active_timer.delete(timer.id)
  }
}
