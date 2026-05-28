import { useEffect, useState } from 'react'
import { db } from '@/db'
import { Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

type TestStatus = 'idle' | 'running' | 'pass' | 'fail'

interface TestResult {
  status: TestStatus
  message: string
  recordId?: number
  readCount?: number
}

/**
 * Runs a Dexie IndexedDB round-trip on mount:
 *   1. Writes a sentinel food_log record
 *   2. Reads it back by id
 *   3. Deletes it (cleanup)
 * Shows pass/fail inline — used only in Phase 1 smoke-testing.
 */
export default function DbSmokeTest() {
  const [result, setResult] = useState<TestResult>({
    status: 'idle',
    message: 'Waiting to run…',
  })

  useEffect(() => {
    let cancelled = false

    async function runTest() {
      if (cancelled) return
      setResult({ status: 'running', message: 'Writing test record…' })

      try {
        // ── 1. Write ───────────────────────────────────────────────────────
        const now = new Date().toISOString()
        const id = await db.food_logs.add({
          userId: 'smoke-test',
          date: now.slice(0, 10),
          mealType: 'other',
          foodName: '__smoke_test__',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          servingSize: 1,
          servingUnit: 'g',
          quantity: 1,
          source: 'manual',
          syncStatus: 'pending',
          createdAt: now,
          updatedAt: now,
        })

        if (cancelled) return
        setResult({ status: 'running', message: 'Reading record back…', recordId: id })

        // ── 2. Read back ───────────────────────────────────────────────────
        const record = await db.food_logs.get(id)
        if (!record) throw new Error('Record not found after write')

        // ── 3. Count all records ───────────────────────────────────────────
        const count = await db.food_logs.count()

        // ── 4. Cleanup ─────────────────────────────────────────────────────
        await db.food_logs.delete(id)

        if (cancelled) return
        setResult({
          status: 'pass',
          message: `Write → Read → Delete ✓ (${count} record${count !== 1 ? 's' : ''} total)`,
          recordId: id,
          readCount: count,
        })
      } catch (err) {
        if (cancelled) return
        setResult({
          status: 'fail',
          message: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    void runTest()
    return () => { cancelled = true }
  }, [])

  const colors = {
    idle:    { bg: 'rgba(30,30,42,0.6)', border: 'rgba(255,255,255,0.06)', icon: '#6b6884', text: '#a09db8' },
    running: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', icon: '#3b82f6', text: '#93c5fd' },
    pass:    { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', icon: '#10b981', text: '#6ee7b7' },
    fail:    { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  icon: '#ef4444', text: '#fca5a5' },
  }[result.status]

  const Icon = result.status === 'running'
    ? Loader2
    : result.status === 'pass'
    ? CheckCircle2
    : result.status === 'fail'
    ? AlertCircle
    : Database

  return (
    <div
      style={{
        margin: '0 0 0 0',
        padding: '12px 14px',
        borderRadius: '12px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.3s ease',
      }}
    >
      <Icon
        size={16}
        color={colors.icon}
        strokeWidth={2}
        style={{
          flexShrink: 0,
          animation: result.status === 'running' ? 'spin 1s linear infinite' : 'none',
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b6884', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          IndexedDB Smoke Test
        </div>
        <div style={{ fontSize: '12px', color: colors.text, lineHeight: 1.4 }}>
          {result.message}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
