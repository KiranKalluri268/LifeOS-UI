import { useState, useEffect, useRef } from 'react'
import type { OFFSearchResult, OFFSearchResponse, OFFRawProduct } from '../food.types'

const OFF_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl'
const FIELDS = 'code,product_name,brands,nutriments,serving_size,image_front_small_url'
const PAGE_SIZE = 12
const DEBOUNCE_MS = 350

function parseServingSize(raw?: string): { size: number; unit: 'g' | 'ml' } {
  if (!raw) return { size: 100, unit: 'g' }
  const match = raw.match(/(\d+(?:\.\d+)?)\s*(g|ml)/i)
  if (!match) return { size: 100, unit: 'g' }
  return {
    size: parseFloat(match[1]),
    unit: match[2].toLowerCase() === 'ml' ? 'ml' : 'g',
  }
}

function normaliseProduct(p: OFFRawProduct): OFFSearchResult | null {
  const name = (p.product_name ?? '').trim()
  if (!name) return null

  const n = p.nutriments ?? {}
  const calories = n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0
  const protein = n.proteins_100g ?? 0
  const carbs = n.carbohydrates_100g ?? 0
  const fat = n.fat_100g ?? 0
  const fiber = n.fiber_100g ?? 0

  const { size, unit } = parseServingSize(p.serving_size)

  return {
    id: p.code ?? crypto.randomUUID(),
    name,
    brand: (p.brands ?? '').split(',')[0].trim(),
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    fiber: Math.round(fiber * 10) / 10,
    servingSize: size,
    servingUnit: unit,
    imageUrl: p.image_front_small_url,
  }
}

export interface UseFoodSearchReturn {
  results: OFFSearchResult[]
  isLoading: boolean
  error: string | null
  query: string
  setQuery: (q: string) => void
  clearResults: () => void
}

/**
 * Debounced Open Food Facts product search hook.
 * Fires when query length >= 2. Cancels in-flight requests on new input.
 */
export function useFoodSearch(): UseFoodSearchReturn {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OFFSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current)

    if (query.trim().length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    timerRef.current = setTimeout(async () => {
      // Cancel any in-flight request
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          search_terms: query.trim(),
          json: '1',
          page_size: String(PAGE_SIZE),
          fields: FIELDS,
          search_simple: '1',
          action: 'process',
        })

        const res = await fetch(`${OFF_SEARCH_URL}?${params}`, {
          signal: abortRef.current.signal,
        })

        if (!res.ok) throw new Error(`OFF API error: ${res.status}`)

        const data: OFFSearchResponse = await res.json()
        const normalised = (data.products ?? [])
          .map(normaliseProduct)
          .filter((p): p is OFFSearchResult => p !== null)

        setResults(normalised)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return // normal cancellation
        setError('Could not reach Open Food Facts. Check your connection.')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  return {
    results,
    isLoading,
    error,
    query,
    setQuery,
    clearResults: () => setResults([]),
  }
}
