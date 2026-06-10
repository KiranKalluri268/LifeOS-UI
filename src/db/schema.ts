import Dexie, { type EntityTable } from 'dexie'
import type {
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
} from './types'

// ─────────────────────────────────────────────────────────────────────────────
// LifeOS Database — Dexie Schema v1
//
// Schema notation:
//   ++id   → auto-increment primary key
//   &field → unique index
//   field  → regular index (for queries/sorting)
//   [a+b]  → compound index
//
// Only add indexes for fields you will actually query/sort by.
// Non-indexed fields are still stored; they just can't be used in .where()
// ─────────────────────────────────────────────────────────────────────────────

export class LifeOSDatabase extends Dexie {
  // ── Food ──────────────────────────────────────────────────────────────────
  food_logs!: EntityTable<FoodLog, 'id'>
  liquid_logs!: EntityTable<LiquidLog, 'id'>
  foods_cache!: EntityTable<FoodCache, 'barcode'>

  // ── Expenses ──────────────────────────────────────────────────────────────
  transactions!: EntityTable<Transaction, 'id'>
  categories!: EntityTable<Category, 'id'>
  budgets!: EntityTable<Budget, 'id'>

  // ── Time & Sleep ──────────────────────────────────────────────────────────
  activity_logs!: EntityTable<ActivityLog, 'id'>
  sleep_logs!: EntityTable<SleepLog, 'id'>
  active_timer!: EntityTable<ActiveTimer, 'id'>

  // ── System ────────────────────────────────────────────────────────────────
  sync_queue!: EntityTable<SyncQueueItem, 'id'>
  user_settings!: EntityTable<UserSettings, 'id'>

  constructor() {
    super('LifeOSDB')

    this.version(1).stores({
      // ── Food
      // Indexed: date (for day queries), mealType (for filtering),
      //          userId (for multi-user), syncStatus (for sync worker)
      food_logs: '++id, date, mealType, userId, syncStatus, [userId+date]',

      // Indexed: date, liquidType, userId, syncStatus
      liquid_logs: '++id, date, liquidType, userId, syncStatus, [userId+date]',

      // Keyed by barcode (unique product id from Open Food Facts)
      // fetchedAt allows cache-busting old entries
      foods_cache: '&barcode, fetchedAt',

      // ── Expenses
      // Indexed: date, type, categoryId — all common filter axes
      transactions:
        '++id, date, type, categoryId, userId, syncStatus, [userId+date]',

      // isDefault helps separate system vs user categories
      categories: '++id, userId, isDefault',

      // Compound on categoryId+month for budget vs spend queries
      budgets: '++id, categoryId, month, userId, [categoryId+month]',

      // ── Time & Sleep
      // Indexed: date, category, userId — for timeline and weekly summary
      activity_logs:
        '++id, date, category, userId, syncStatus, [userId+date]',

      // date index for fetching last N nights
      sleep_logs: '++id, date, userId, syncStatus, [userId+date]',

      // Typically one row per user; userId index lets us fetch it quickly
      active_timer: '++id, userId',

      // ── System
      // tableName+recordId lets us dedupe queued writes
      sync_queue: '++id, tableName, recordId, attempts, createdAt',

      // One row per user
      user_settings: '++id, &userId',
    })

    // v2: add syncStatus index to categories so sync engine can query pending items
    this.version(2).stores({
      categories: '++id, userId, isDefault, syncStatus',
    })
  }
}
