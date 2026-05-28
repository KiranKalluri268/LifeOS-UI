// ─────────────────────────────────────────────────────────────────────────────
// LifeOS DB — Singleton instance + seed helpers
// Import `db` anywhere in the app; it's safe to import from multiple files.
// ─────────────────────────────────────────────────────────────────────────────
import { LifeOSDatabase } from './schema'
import type { Category, UserSettings } from './types'

/** The single shared Dexie instance for the entire app */
export const db = new LifeOSDatabase()

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  { userId: 'local', name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#f97316', isDefault: true },
  { userId: 'local', name: 'Transport',     icon: 'Car',             color: '#3b82f6', isDefault: true },
  { userId: 'local', name: 'Health',        icon: 'HeartPulse',      color: '#ef4444', isDefault: true },
  { userId: 'local', name: 'Entertainment', icon: 'Clapperboard',    color: '#8b5cf6', isDefault: true },
  { userId: 'local', name: 'Utilities',     icon: 'Zap',             color: '#f59e0b', isDefault: true },
  { userId: 'local', name: 'Shopping',      icon: 'ShoppingBag',     color: '#ec4899', isDefault: true },
  { userId: 'local', name: 'Work',          icon: 'Briefcase',       color: '#10b981', isDefault: true },
  { userId: 'local', name: 'Other',         icon: 'MoreHorizontal',  color: '#6b7280', isDefault: true },
]

const DEFAULT_SETTINGS: Omit<UserSettings, 'id'> = {
  userId: 'local',
  calorieTarget:  2000,
  proteinTargetG: 150,
  carbTargetG:    250,
  fatTargetG:     65,
  waterTargetMl:  2500,
  currency:       '₹',
  currencyCode:   'INR',
  weekStartDay:   1,
  theme:          'dark',
  createdAt:      new Date().toISOString(),
  updatedAt:      new Date().toISOString(),
}

// ─── Seed on first run ────────────────────────────────────────────────────────

/**
 * Seeds default categories and user settings if the DB is freshly created.
 * Safe to call on every app boot — it's idempotent.
 */
export async function seedDefaults(): Promise<void> {
  // Sequential awaits — no transaction wrapper needed for one-time seed.
  // Avoids naming ambiguity between Dexie's .transaction() method and the
  // .transactions table property on LifeOSDatabase.
  const categoryCount = await db.categories.count()
  if (categoryCount === 0) {
    const now = new Date().toISOString()
    await db.categories.bulkAdd(
      DEFAULT_CATEGORIES.map((c) => ({ ...c, createdAt: now }))
    )
  }

  const settingsCount = await db.user_settings.count()
  if (settingsCount === 0) {
    await db.user_settings.add(DEFAULT_SETTINGS)
  }
}

// ─── Re-export types for convenience ─────────────────────────────────────────
export type {
  FoodLog,
  LiquidLog,
  FoodCache,
  Transaction,
  Category,
  Budget,
  ActivityLog,
  SleepLog,
  ActiveTimer,
  SyncQueueItem,
  UserSettings,
  MealType,
  ActivityCategory,
  LiquidType,
  TransactionType,
  SyncOperation,
  SyncStatus,
} from './types'
