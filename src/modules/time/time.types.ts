import type { ActivityCategory } from '@/db/types'

// ── Category metadata ─────────────────────────────────────────────────────────

export interface ActivityMeta {
  label: string
  color: string
  emoji: string
}

export const ACTIVITY_META: Record<ActivityCategory, ActivityMeta> = {
  deep_work:    { label: 'Deep Work',    color: '#6366f1', emoji: '🧠' },
  shallow_work: { label: 'Shallow Work', color: '#8b5cf6', emoji: '💼' },
  exercise:     { label: 'Exercise',     color: '#10b981', emoji: '💪' },
  leisure:      { label: 'Leisure',      color: '#f59e0b', emoji: '🎮' },
  meal:         { label: 'Meal',         color: '#f97316', emoji: '🍽️' },
  commute:      { label: 'Commute',      color: '#3b82f6', emoji: '🚗' },
  idle:         { label: 'Idle',         color: '#6b7280', emoji: '😴' },
  other:        { label: 'Other',        color: '#a09db8', emoji: '📌' },
}

export const ACTIVITY_CATEGORIES = Object.keys(ACTIVITY_META) as ActivityCategory[]

// ── Time helpers ─────────────────────────────────────────────────────────────

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function formatElapsed(startISO: string): string {
  const diffMs = Date.now() - new Date(startISO).getTime()
  const totalSecs = Math.floor(diffMs / 1000)
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** YYYY-MM-DD of today */
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

/** YYYY-MM-DD of N days ago */
export function daysAgoStr(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

/** Convert local datetime-local string (YYYY-MM-DDTHH:mm) to ISO */
export function localToISO(local: string): string {
  return new Date(local).toISOString()
}

/** ISO → datetime-local string for <input type="datetime-local"> */
export function isoToLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Duration in minutes between two ISO strings */
export function diffMins(startISO: string, endISO: string): number {
  return Math.max(0, Math.round((new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000))
}

export type { ActivityCategory }
