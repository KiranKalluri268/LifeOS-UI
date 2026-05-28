import { useState, useCallback } from 'react'
import { Search, ArrowLeft, Check } from 'lucide-react'
import BottomSheet from '@/components/BottomSheet'
import MealTypeSelector, { getDefaultMealType } from './MealTypeSelector'
import FoodSearchResults from './FoodSearchResults'
import MacroEditor from './MacroEditor'
import { useFoodSearch } from '../hooks/useFoodSearch'
import {
  EMPTY_DRAFT,
  computeTotals,
  draftFromSearchResult,
  type FoodEntryDraft,
  type OFFSearchResult,
  type MealType,
} from '../food.types'
import { db } from '@/db'

type SheetStep = 'search' | 'form'

interface AddFoodSheetProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  initialMealType?: MealType
}

export default function AddFoodSheet({
  isOpen,
  onClose,
  onSaved,
  initialMealType,
}: AddFoodSheetProps) {
  const [step, setStep] = useState<SheetStep>('search')
  const [draft, setDraft] = useState<FoodEntryDraft>({
    ...EMPTY_DRAFT,
    mealType: initialMealType ?? getDefaultMealType(),
  })
  const [isSaving, setIsSaving] = useState(false)

  const { query, setQuery, results, isLoading, error, clearResults } = useFoodSearch()

  const totals = computeTotals(draft)

  const handleClose = useCallback(() => {
    onClose()
    // Reset after animation completes
    setTimeout(() => {
      setStep('search')
      setQuery('')
      clearResults()
      setDraft({ ...EMPTY_DRAFT, mealType: getDefaultMealType() })
    }, 400)
  }, [onClose, setQuery, clearResults])

  const handleSelectResult = (result: OFFSearchResult) => {
    setDraft(draftFromSearchResult(result, draft.mealType))
    setStep('form')
  }

  const handleManualEntry = () => {
    setDraft((prev) => ({ ...EMPTY_DRAFT, foodName: query, mealType: prev.mealType, source: 'manual' }))
    setStep('form')
  }

  const handleDraftChange = (updates: Partial<FoodEntryDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }))
  }

  const handleSave = async () => {
    if (!draft.foodName.trim()) return
    setIsSaving(true)
    try {
      const now = new Date().toISOString()
      const today = now.slice(0, 10)
      await db.food_logs.add({
        userId: 'local',
        date: today,
        mealType: draft.mealType,
        foodName: draft.foodName.trim(),
        brand: draft.brand || undefined,
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        fiber: totals.fiber,
        servingSize: draft.amountG,
        servingUnit: draft.servingUnit,
        quantity: 1,
        barcode: draft.barcode,
        source: draft.source,
        notes: draft.notes || undefined,
        syncStatus: 'pending',
        createdAt: now,
        updatedAt: now,
      })
      onSaved()
      handleClose()
    } catch (err) {
      console.error('Failed to save food log:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const sheetTitle = step === 'search' ? 'Log Food' : draft.foodName || 'Edit Entry'

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title={sheetTitle}
      accentColor="#f97316"
    >
      <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Meal type selector (always visible) */}
        <MealTypeSelector
          value={draft.mealType}
          onChange={(m) => handleDraftChange({ mealType: m })}
        />

        {/* ── STEP: Search ───────────────────────────────────────────────── */}
        {step === 'search' && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0 12px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Search size={16} color="#6b6884" strokeWidth={2} />
              <input
                autoFocus
                type="text"
                placeholder="Search food (e.g. banana, amul butter…)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  color: '#f1f0f7',
                  fontFamily: 'inherit',
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  style={{ background: 'none', border: 'none', color: '#6b6884', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
                >
                  ×
                </button>
              )}
            </div>

            <FoodSearchResults
              results={results}
              isLoading={isLoading}
              error={error}
              query={query}
              onSelect={handleSelectResult}
              onManualEntry={handleManualEntry}
            />
          </>
        )}

        {/* ── STEP: Form ─────────────────────────────────────────────────── */}
        {step === 'form' && (
          <>
            {/* Back + food name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setStep('search')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a09db8', padding: '4px', display: 'flex' }}
                aria-label="Back to search"
              >
                <ArrowLeft size={18} strokeWidth={2} />
              </button>
              <input
                type="text"
                value={draft.foodName}
                onChange={(e) => handleDraftChange({ foodName: e.target.value })}
                placeholder="Food name"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f1f0f7',
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>

            {/* Brand (optional) */}
            <input
              type="text"
              value={draft.brand}
              onChange={(e) => handleDraftChange({ brand: e.target.value })}
              placeholder="Brand (optional)"
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#a09db8',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />

            {/* Macro editor */}
            <MacroEditor
              draft={draft}
              totals={totals}
              onDraftChange={handleDraftChange}
            />

            {/* Notes */}
            <input
              type="text"
              value={draft.notes}
              onChange={(e) => handleDraftChange({ notes: e.target.value })}
              placeholder="Notes (optional)"
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#a09db8',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={isSaving || !draft.foodName.trim()}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '14px',
                background: draft.foodName.trim()
                  ? 'linear-gradient(135deg, #f97316, #ea580c)'
                  : 'rgba(255,255,255,0.06)',
                border: 'none',
                color: draft.foodName.trim() ? '#fff' : '#6b6884',
                fontSize: '15px',
                fontWeight: 700,
                cursor: draft.foodName.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
              }}
            >
              <Check size={18} strokeWidth={2.5} />
              {isSaving ? 'Saving…' : `Save — ${totals.calories} kcal`}
            </button>
          </>
        )}
      </div>
    </BottomSheet>
  )
}
