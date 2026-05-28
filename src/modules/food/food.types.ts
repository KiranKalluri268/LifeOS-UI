import type { MealType } from '@/db/types'

// ── Open Food Facts API ───────────────────────────────────────────────────────

/** Normalised product from the OFF search API */
export interface OFFSearchResult {
  /** barcode / OFF product code */
  id: string
  name: string
  brand: string
  /** Per 100g */
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  servingSize: number   // grams
  servingUnit: 'g' | 'ml'
  imageUrl?: string
}

/** Raw OFF search response shape (partial) */
export interface OFFSearchResponse {
  products: OFFRawProduct[]
  count: number
  page: number
}

export interface OFFRawProduct {
  code: string
  product_name?: string
  brands?: string
  image_front_small_url?: string
  serving_size?: string
  nutriments?: {
    'energy-kcal_100g'?: number
    'energy-kcal'?: number
    proteins_100g?: number
    carbohydrates_100g?: number
    fat_100g?: number
    fiber_100g?: number
  }
}

// ── Entry form state ──────────────────────────────────────────────────────────

/** Draft state held in AddFoodSheet while the user fills in the form */
export interface FoodEntryDraft {
  foodName: string
  brand: string
  mealType: MealType
  /** Quantity the user specifies (in grams or ml) */
  amountG: number
  servingUnit: 'g' | 'ml'
  /** Base macro values per 100 g — used to scale when amount changes */
  baseCalsPer100: number
  baseProteinPer100: number
  baseCarbsPer100: number
  baseFatPer100: number
  baseFiberPer100: number
  notes: string
  barcode?: string
  source: 'manual' | 'openfoodfacts'
}

/** Computed totals derived from draft (amount * base / 100) */
export interface MacroTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export function computeTotals(draft: FoodEntryDraft): MacroTotals {
  const factor = draft.amountG / 100
  return {
    calories: Math.round(draft.baseCalsPer100 * factor),
    protein:  Math.round(draft.baseProteinPer100 * factor * 10) / 10,
    carbs:    Math.round(draft.baseCarbsPer100 * factor * 10) / 10,
    fat:      Math.round(draft.baseFatPer100 * factor * 10) / 10,
    fiber:    Math.round(draft.baseFiberPer100 * factor * 10) / 10,
  }
}

export const EMPTY_DRAFT: FoodEntryDraft = {
  foodName: '',
  brand: '',
  mealType: 'breakfast',
  amountG: 100,
  servingUnit: 'g',
  baseCalsPer100: 0,
  baseProteinPer100: 0,
  baseCarbsPer100: 0,
  baseFatPer100: 0,
  baseFiberPer100: 0,
  notes: '',
  source: 'manual',
}

/** Maps an OFF search result into a FoodEntryDraft */
export function draftFromSearchResult(
  result: OFFSearchResult,
  mealType: MealType,
): FoodEntryDraft {
  return {
    ...EMPTY_DRAFT,
    foodName: result.name,
    brand: result.brand,
    mealType,
    amountG: result.servingSize > 0 ? result.servingSize : 100,
    servingUnit: result.servingUnit,
    baseCalsPer100: result.calories,
    baseProteinPer100: result.protein,
    baseCarbsPer100: result.carbs,
    baseFatPer100: result.fat,
    baseFiberPer100: result.fiber,
    barcode: result.id,
    source: 'openfoodfacts',
  }
}

export type { MealType }
