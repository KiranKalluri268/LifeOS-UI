import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import type { InsightCard, WeeklyDigestData } from '../insights.types'

// ── Date helpers (local to avoid circular imports) ───────────────────────────

function today(): string { return new Date().toISOString().slice(0, 10) }

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => daysAgo(6 - i))
}

function shortLabel(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })
}

// ─────────────────────────────────────────────────────────────────────────────

export interface InsightsEngineResult {
  cards: InsightCard[]
  digest: WeeklyDigestData
  isReady: boolean
}

export function useInsightsEngine(): InsightsEngineResult {
  const start14 = daysAgo(13)
  const start7  = daysAgo(6)
  const end     = today()

  const activityLogs = useLiveQuery(
    () => db.activity_logs.where('date').between(start14, end, true, true).toArray(),
    [start14, end], []
  )
  const sleepLogs = useLiveQuery(
    () => db.sleep_logs.where('date').between(start14, end, true, true).toArray(),
    [start14, end], []
  )
  const foodLogs = useLiveQuery(
    () => db.food_logs.where('date').between(start7, end, true, true).toArray(),
    [start7, end], []
  )
  const transactions = useLiveQuery(
    () => db.transactions.where('date').between(start14, end, true, true).toArray(),
    [start14, end], []
  )
  const categories = useLiveQuery(
    () => db.categories.toArray(),
    [], []
  )
  const settings = useLiveQuery(
    () => db.user_settings.toArray().then(r => r[0] ?? null),
    [], null
  )

  const result = useMemo(() => {
    const days7 = last7Days()
    const catMap = new Map(categories.map(c => [c.id!, c]))

    // ── Per-day aggregates (14 days) ──────────────────────────────────────────

    const sleepByDate   = new Map(sleepLogs.map(s => [s.date, s]))
    const actByDate     = new Map<string, { deep: number; shallow: number; exercise: boolean; total: number }>()
    const foodByDate    = new Map<string, { cals: number; protein: number }>()
    const spendByDate   = new Map<string, number>()

    for (const log of activityLogs) {
      if (!actByDate.has(log.date)) actByDate.set(log.date, { deep: 0, shallow: 0, exercise: false, total: 0 })
      const d = actByDate.get(log.date)!
      if (log.category === 'deep_work')    d.deep    += log.durationMins
      if (log.category === 'shallow_work') d.shallow += log.durationMins
      if (log.category === 'exercise')     d.exercise = true
      d.total += log.durationMins
    }

    for (const f of foodLogs) {
      if (!foodByDate.has(f.date)) foodByDate.set(f.date, { cals: 0, protein: 0 })
      const d = foodByDate.get(f.date)!
      d.cals    += f.calories
      d.protein += f.protein
    }

    for (const t of transactions) {
      if (t.type === 'expense') {
        spendByDate.set(t.date, (spendByDate.get(t.date) ?? 0) + t.amount)
      }
    }

    // ── Insight 1: Sleep → Deep Work ─────────────────────────────────────────

    let goodSleepDeep = 0, goodSleepCount = 0
    let poorSleepDeep = 0, poorSleepCount = 0

    for (const sl of sleepLogs) {
      const act = actByDate.get(sl.date)
      const deepH = act ? act.deep / 60 : 0
      if (sl.durationMins >= 7 * 60) { goodSleepDeep += deepH; goodSleepCount++ }
      else                            { poorSleepDeep += deepH; poorSleepCount++ }
    }

    const avgGoodDeep = goodSleepCount > 0 ? goodSleepDeep / goodSleepCount : 0
    const avgPoorDeep = poorSleepCount > 0 ? poorSleepDeep / poorSleepCount : 0
    const sleepDeepPct = avgPoorDeep > 0
      ? Math.round(((avgGoodDeep - avgPoorDeep) / avgPoorDeep) * 100)
      : null

    const sleepProductivityCard: InsightCard = {
      id: 'sleep-productivity',
      emoji: '🧠',
      title: 'Sleep & Deep Work',
      metric: sleepDeepPct !== null
        ? `${sleepDeepPct > 0 ? '+' : ''}${sleepDeepPct}%`
        : avgGoodDeep > 0 ? `${avgGoodDeep.toFixed(1)}h` : '—',
      metricLabel: sleepDeepPct !== null ? 'more focus on good sleep' : 'avg deep work on 7h+ sleep',
      description: sleepDeepPct !== null
        ? `After ≥7h sleep, you average ${avgGoodDeep.toFixed(1)}h deep work vs ${avgPoorDeep.toFixed(1)}h on poor nights.`
        : goodSleepCount === 0 && poorSleepCount === 0
          ? 'Log sleep + deep work sessions to unlock this insight.'
          : `Average ${avgGoodDeep.toFixed(1)}h of deep work on nights with good sleep.`,
      trend: sleepDeepPct !== null ? (sleepDeepPct > 0 ? 'positive' : 'negative') : 'none',
      color: '#6366f1',
      insufficient: sleepLogs.length < 3,
      sparkData: days7.map(d => ({
        label: shortLabel(d),
        value: (actByDate.get(d)?.deep ?? 0) / 60,
        value2: sleepByDate.has(d) ? sleepByDate.get(d)!.durationMins / 60 : 0,
      })),
    }

    // ── Insight 2: Exercise → Sleep Quality ───────────────────────────────────

    let exSleepTotal = 0, exSleepCount = 0
    let noExSleepTotal = 0, noExSleepCount = 0

    for (const sl of sleepLogs) {
      const hasEx = actByDate.get(sl.date)?.exercise ?? false
      if (hasEx) { exSleepTotal += sl.quality; exSleepCount++ }
      else        { noExSleepTotal += sl.quality; noExSleepCount++ }
    }

    const avgExSleep   = exSleepCount   > 0 ? (exSleepTotal   / exSleepCount).toFixed(1)   : '—'
    const avgNoExSleep = noExSleepCount > 0 ? (noExSleepTotal / noExSleepCount).toFixed(1) : '—'

    const exerciseSleepCard: InsightCard = {
      id: 'exercise-sleep',
      emoji: '💪',
      title: 'Exercise & Sleep',
      metric: avgExSleep !== '—' ? `${avgExSleep}/5` : '—',
      metricLabel: 'avg sleep quality on exercise days',
      description: avgExSleep !== '—' && avgNoExSleep !== '—'
        ? `Sleep quality ${avgExSleep}/5 on exercise days vs ${avgNoExSleep}/5 on rest days.`
        : 'Log exercise + sleep to see how workouts affect rest quality.',
      trend: avgExSleep !== '—' && avgNoExSleep !== '—'
        ? (parseFloat(avgExSleep) > parseFloat(avgNoExSleep) ? 'positive' : 'neutral')
        : 'none',
      color: '#10b981',
      insufficient: exSleepCount < 2,
      sparkData: days7.map(d => ({
        label: shortLabel(d),
        value: sleepByDate.get(d)?.quality ?? 0,
        value2: actByDate.get(d)?.exercise ? 1 : 0,
      })),
    }

    // ── Insight 3: Spending Trend (this week vs last week) ────────────────────

    const thisWeekSpend = days7.reduce((s, d) => s + (spendByDate.get(d) ?? 0), 0)
    const lastWeekDays  = Array.from({ length: 7 }, (_, i) => daysAgo(13 - i))
    const lastWeekSpend = lastWeekDays.reduce((s, d) => s + (spendByDate.get(d) ?? 0), 0)
    const spendChange   = lastWeekSpend > 0
      ? Math.round(((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100)
      : null

    const spendCard: InsightCard = {
      id: 'spending-trend',
      emoji: '💸',
      title: 'Weekly Spending',
      metric: `₹${Math.round(thisWeekSpend).toLocaleString('en-IN')}`,
      metricLabel: 'this week',
      description: spendChange !== null
        ? `${spendChange > 0 ? '+' : ''}${spendChange}% vs last week (₹${Math.round(lastWeekSpend).toLocaleString('en-IN')}).`
        : thisWeekSpend === 0
          ? 'No expenses logged this week yet.'
          : 'Log more weeks to see spending trends.',
      trend: spendChange !== null ? (spendChange < 0 ? 'positive' : spendChange > 20 ? 'negative' : 'neutral') : 'none',
      color: '#ef4444',
      insufficient: thisWeekSpend === 0,
      sparkData: days7.map(d => ({
        label: shortLabel(d),
        value: spendByDate.get(d) ?? 0,
      })),
    }

    // ── Insight 4: Calorie Tracking Consistency ───────────────────────────────

    const daysWithFood = days7.filter(d => foodByDate.has(d)).length
    const totalCals    = days7.reduce((s, d) => s + (foodByDate.get(d)?.cals ?? 0), 0)
    const avgCals      = daysWithFood > 0 ? Math.round(totalCals / daysWithFood) : 0
    const target       = settings?.calorieTarget ?? 2000

    const calorieCard: InsightCard = {
      id: 'calorie-consistency',
      emoji: '🍽️',
      title: 'Calorie Tracking',
      metric: `${daysWithFood}/7`,
      metricLabel: 'days tracked this week',
      description: daysWithFood > 0
        ? `Averaging ${avgCals.toLocaleString()} kcal/day on tracked days (target: ${target.toLocaleString()}).`
        : 'Open the Food tab and log a meal to start tracking.',
      trend: daysWithFood >= 5 ? 'positive' : daysWithFood >= 3 ? 'neutral' : 'none',
      color: '#f97316',
      insufficient: daysWithFood === 0,
      sparkData: days7.map(d => ({
        label: shortLabel(d),
        value: foodByDate.get(d)?.cals ?? 0,
      })),
    }

    // ── Insight 5: Productivity Balance ───────────────────────────────────────

    const totalTrackedMins7 = days7.reduce((s, d) => s + (actByDate.get(d)?.total ?? 0), 0)
    const productiveMins7   = days7.reduce((s, d) => {
      const a = actByDate.get(d)
      return s + (a ? a.deep + a.shallow : 0)
    }, 0)
    const productivePct = totalTrackedMins7 > 0
      ? Math.round((productiveMins7 / totalTrackedMins7) * 100)
      : null

    const productivityCard: InsightCard = {
      id: 'productivity-balance',
      emoji: '⏱️',
      title: 'Productivity Balance',
      metric: productivePct !== null ? `${productivePct}%` : '—',
      metricLabel: 'of tracked time is productive',
      description: productivePct !== null
        ? `${(productiveMins7 / 60).toFixed(1)}h productive of ${(totalTrackedMins7 / 60).toFixed(1)}h tracked this week.`
        : 'Start the timer or log time blocks to unlock this insight.',
      trend: productivePct !== null
        ? (productivePct >= 50 ? 'positive' : productivePct >= 30 ? 'neutral' : 'negative')
        : 'none',
      color: '#6366f1',
      insufficient: totalTrackedMins7 === 0,
      sparkData: days7.map(d => ({
        label: shortLabel(d),
        value: (actByDate.get(d)?.deep ?? 0 + (actByDate.get(d)?.shallow ?? 0)) / 60,
      })),
    }

    // ── Weekly digest ─────────────────────────────────────────────────────────

    // Top spending category
    const spendByCat: Record<number, number> = {}
    for (const t of transactions) {
      if (t.type === 'expense' && days7.includes(t.date)) {
        spendByCat[t.categoryId] = (spendByCat[t.categoryId] ?? 0) + t.amount
      }
    }
    const topCatEntry = Object.entries(spendByCat).sort(([, a], [, b]) => b - a)[0]
    const topCat = topCatEntry ? catMap.get(parseInt(topCatEntry[0])) : undefined

    const totalProtein7 = days7.reduce((s, d) => s + (foodByDate.get(d)?.protein ?? 0), 0)
    const avgSleepMins  = sleepLogs.filter(s => days7.includes(s.date))
    const avgSleepH = avgSleepMins.length > 0
      ? avgSleepMins.reduce((s, l) => s + l.durationMins, 0) / avgSleepMins.length / 60
      : 0

    const digest: WeeklyDigestData = {
      avgCaloriesPerDay: daysWithFood > 0 ? Math.round(totalCals / daysWithFood) : 0,
      calorieTarget: target,
      daysWithFoodLogged: daysWithFood,
      avgProtein: daysWithFood > 0 ? Math.round(totalProtein7 / daysWithFood) : 0,
      totalSpend: thisWeekSpend,
      totalIncome: transactions.filter(t => t.type === 'income' && days7.includes(t.date)).reduce((s, t) => s + t.amount, 0),
      topCategoryName: topCat?.name ?? '—',
      topCategoryColor: topCat?.color ?? '#6b7280',
      totalTrackedHours: Math.round((totalTrackedMins7 / 60) * 10) / 10,
      deepWorkHours: Math.round((days7.reduce((s, d) => s + (actByDate.get(d)?.deep ?? 0), 0) / 60) * 10) / 10,
      avgSleepHours: Math.round(avgSleepH * 10) / 10,
      sleepNightsLogged: avgSleepMins.length,
    }

    return {
      cards: [sleepProductivityCard, exerciseSleepCard, spendCard, calorieCard, productivityCard],
      digest,
      isReady: true,
    }
  }, [activityLogs, sleepLogs, foodLogs, transactions, categories, settings])

  return result
}
