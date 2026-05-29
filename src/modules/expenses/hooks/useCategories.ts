import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import type { Category } from '@/db/types'

export type { Category }

/**
 * Returns all categories (default + custom) sorted by name.
 * Reactive — updates instantly when a category is added/removed.
 * Note: 'name' is not a Dexie index so we sort in JS after fetch.
 */
export function useCategories(): Category[] {
  return useLiveQuery(
    () => db.categories.toArray().then((cats) =>
      cats.slice().sort((a, b) => a.name.localeCompare(b.name))
    ),
    [],
    []
  )
}

/** Returns a Map<id, Category> for O(1) lookups */
export function useCategoryMap(): Map<number, Category> {
  const cats = useCategories()
  return new Map(cats.filter(c => c.id != null).map(c => [c.id!, c]))
}
