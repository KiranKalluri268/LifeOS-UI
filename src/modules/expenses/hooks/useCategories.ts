import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import type { Category } from '@/db/types'

export type { Category }

/**
 * Returns all categories (default + custom) sorted by name.
 * Reactive — updates instantly when a category is added/removed.
 */
export function useCategories(): Category[] {
  return useLiveQuery(
    () => db.categories.orderBy('name').toArray(),
    [],
    []
  )
}

/** Returns a Map<id, Category> for O(1) lookups */
export function useCategoryMap(): Map<number, Category> {
  const cats = useCategories()
  return new Map(cats.filter(c => c.id != null).map(c => [c.id!, c]))
}
