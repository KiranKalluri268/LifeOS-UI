// ─────────────────────────────────────────────────────────────────────────────
// LifeOS — Database Row Types
// Every interface maps 1:1 to a Dexie table. Optional `id` means Dexie
// auto-assigns it on insert (++id). All timestamps are ISO-8601 strings.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Shared ──────────────────────────────────────────────────────────────────

export type SyncStatus = 'pending' | 'synced' | 'failed'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
export type ActivityCategory =
  | 'deep_work'
  | 'shallow_work'
  | 'exercise'
  | 'leisure'
  | 'meal'
  | 'commute'
  | 'idle'
  | 'other'
export type LiquidType = 'water' | 'coffee' | 'tea' | 'juice' | 'alcohol' | 'other'
export type TransactionType = 'income' | 'expense'
export type SyncOperation = 'create' | 'update' | 'delete'

// ─── Module: Food ─────────────────────────────────────────────────────────────

/** A single food/meal entry in the log */
export interface FoodLog {
  id?: number
  userId: string
  /** YYYY-MM-DD */
  date: string
  mealType: MealType
  foodName: string
  brand?: string
  /** kcal per serving × quantity */
  calories: number
  /** grams */
  protein: number
  /** grams */
  carbs: number
  /** grams */
  fat: number
  /** grams */
  fiber?: number
  servingSize: number
  servingUnit: string
  quantity: number
  barcode?: string
  /** 'manual' | 'openfoodfacts' | 'barcode' */
  source: 'manual' | 'openfoodfacts' | 'barcode'
  notes?: string
  syncStatus: SyncStatus
  createdAt: string
  updatedAt: string
}

/** Hydration / liquid intake entry */
export interface LiquidLog {
  id?: number
  userId: string
  /** YYYY-MM-DD */
  date: string
  liquidType: LiquidType
  /** millilitres */
  amountMl: number
  notes?: string
  syncStatus: SyncStatus
  createdAt: string
}

/** Cached Open Food Facts product — keyed by barcode */
export interface FoodCache {
  barcode: string
  name: string
  brand?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  servingSize: number
  servingUnit: string
  imageUrl?: string
  /** ISO timestamp of when we last fetched this */
  fetchedAt: string
}

// ─── Module: Expenses ─────────────────────────────────────────────────────────

/** Income or expense transaction */
export interface Transaction {
  id?: number
  userId: string
  /** YYYY-MM-DD */
  date: string
  type: TransactionType
  /** Always stored as a positive number */
  amount: number
  categoryId: number
  note?: string
  syncStatus: SyncStatus
  createdAt: string
  updatedAt: string
}

/** Expense category (8 defaults + user-defined) */
export interface Category {
  id?: number
  userId: string
  name: string
  /** lucide-react icon name */
  icon: string
  /** Tailwind or hex colour token */
  color: string
  isDefault: boolean
  createdAt: string
  syncStatus?: SyncStatus
}

/** Monthly budget target per category */
export interface Budget {
  id?: number
  userId: string
  categoryId: number
  /** YYYY-MM */
  month: string
  amount: number
  createdAt: string
  updatedAt: string
}

// ─── Module: Time & Sleep ─────────────────────────────────────────────────────

/** A logged block of time (completed activity) */
export interface ActivityLog {
  id?: number
  userId: string
  /** YYYY-MM-DD */
  date: string
  category: ActivityCategory
  /** ISO timestamp */
  startTime: string
  /** ISO timestamp */
  endTime: string
  /** Computed: (endTime - startTime) in minutes */
  durationMins: number
  note?: string
  syncStatus: SyncStatus
  createdAt: string
  updatedAt: string
}

/** Sleep session */
export interface SleepLog {
  id?: number
  userId: string
  /** YYYY-MM-DD (the date you went to bed) */
  date: string
  /** ISO timestamp */
  bedtime: string
  /** ISO timestamp */
  wakeTime: string
  /** Computed in minutes */
  durationMins: number
  /** 1 (terrible) – 5 (excellent) */
  quality: 1 | 2 | 3 | 4 | 5
  notes?: string
  syncStatus: SyncStatus
  createdAt: string
  updatedAt: string
}

/** Persists the currently running timer so it survives page reloads.
 *  There should be at most one row per user at any time. */
export interface ActiveTimer {
  id?: number
  userId: string
  category: ActivityCategory
  /** ISO timestamp when the timer was started */
  startTime: string
  note?: string
  createdAt: string
}

// ─── Sync Queue ───────────────────────────────────────────────────────────────

/** Queued write that must be sent to the server when online */
export interface SyncQueueItem {
  id?: number
  /** Name of the Dexie table this write targets */
  tableName: string
  /** The local Dexie record id */
  recordId: number
  operation: SyncOperation
  /** Full record snapshot (JSON-serialisable) */
  payload: Record<string, unknown>
  /** Number of failed upload attempts */
  attempts: number
  createdAt: string
}

// ─── User Settings ────────────────────────────────────────────────────────────

/** Single row of user preferences and targets */
export interface UserSettings {
  id?: number
  userId: string

  // Nutrition targets (daily)
  calorieTarget: number
  proteinTargetG: number
  carbTargetG: number
  fatTargetG: number
  waterTargetMl: number

  // Expense preferences
  currency: string
  /** e.g. 'INR' | 'USD' | 'EUR' */
  currencyCode: string

  // Time preferences
  /** 0 = Sunday, 1 = Monday */
  weekStartDay: 0 | 1

  // App preferences
  theme: 'dark' | 'light' | 'system'

  // Sync state
  lastSyncAt?: string

  createdAt: string
  updatedAt: string
}
