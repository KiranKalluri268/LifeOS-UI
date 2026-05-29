// ── Insight card returned by the engine ───────────────────────────────────────

export interface SparkPoint {
  label: string   // e.g. "Mon"
  value: number
  /** Optional second series for comparison charts */
  value2?: number
}

export interface InsightCard {
  id: string
  emoji: string
  title: string
  /** Large headline metric displayed prominently */
  metric: string
  metricLabel: string
  /** Supporting sentence explaining the insight */
  description: string
  /** Drives the trend arrow + colour */
  trend: 'positive' | 'negative' | 'neutral' | 'none'
  /** Hex colour that matches the relevant module */
  color: string
  /** 7-point time series for the mini sparkline */
  sparkData: SparkPoint[]
  /** True when we don't have enough data to be meaningful */
  insufficient: boolean
}

// ── Weekly digest returned by the engine ──────────────────────────────────────

export interface WeeklyDigestData {
  // Food
  avgCaloriesPerDay: number
  calorieTarget: number
  daysWithFoodLogged: number
  avgProtein: number

  // Expenses
  totalSpend: number
  totalIncome: number
  topCategoryName: string
  topCategoryColor: string

  // Time & Sleep
  totalTrackedHours: number
  deepWorkHours: number
  avgSleepHours: number
  sleepNightsLogged: number
}
