import type { FoodEntryDraft, MacroTotals } from '../food.types'

interface MacroFieldProps {
  label: string
  unit: string
  value: number
  color: string
  onChange: (v: number) => void
}

function MacroField({ label, unit, value, color, onChange }: MacroFieldProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        alignItems: 'center',
        padding: '10px 4px',
        borderRadius: '12px',
        background: `${color}0f`,
        border: `1px solid ${color}25`,
      }}
    >
      <span style={{ fontSize: '10px', fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <input
        type="number"
        min={0}
        step={0.1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 700,
          color: '#f1f0f7',
          fontFamily: 'inherit',
          MozAppearance: 'textfield',
        }}
      />
      <span style={{ fontSize: '10px', color: '#6b6884' }}>{unit}</span>
    </div>
  )
}

interface MacroEditorProps {
  draft: FoodEntryDraft
  totals: MacroTotals
  onDraftChange: (updated: Partial<FoodEntryDraft>) => void
}

/**
 * Editable macro fields.
 * Amount input scales all macros proportionally.
 * Each macro can also be overridden directly.
 */
export default function MacroEditor({ draft, totals, onDraftChange }: MacroEditorProps) {
  const handleAmountChange = (newAmount: number) => {
    onDraftChange({ amountG: newAmount })
  }

  // When user directly edits a macro, back-calculate the per-100g base value
  const overrideMacro = (field: keyof Pick<FoodEntryDraft, 'baseCalsPer100' | 'baseProteinPer100' | 'baseCarbsPer100' | 'baseFatPer100'>, totalValue: number) => {
    const per100 = draft.amountG > 0 ? (totalValue / draft.amountG) * 100 : 0
    onDraftChange({ [field]: per100 })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Amount row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span style={{ fontSize: '14px', color: '#a09db8', flex: 1 }}>Amount</span>
        <input
          type="number"
          min={1}
          step={1}
          value={draft.amountG}
          onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
          style={{
            width: '80px',
            padding: '6px 10px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f1f0f7',
            fontSize: '16px',
            fontWeight: 600,
            textAlign: 'right',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        {/* Unit toggle */}
        <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          {(['g', 'ml'] as const).map((u) => (
            <button
              key={u}
              onClick={() => onDraftChange({ servingUnit: u })}
              style={{
                padding: '6px 10px',
                background: draft.servingUnit === u ? 'rgba(249,115,22,0.25)' : 'transparent',
                color: draft.servingUnit === u ? '#f97316' : '#6b6884',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'inherit',
              }}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Macro fields */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <MacroField
          label="Calories"
          unit="kcal"
          value={totals.calories}
          color="#f97316"
          onChange={(v) => overrideMacro('baseCalsPer100', v)}
        />
        <MacroField
          label="Protein"
          unit="g"
          value={totals.protein}
          color="#3b82f6"
          onChange={(v) => overrideMacro('baseProteinPer100', v)}
        />
        <MacroField
          label="Carbs"
          unit="g"
          value={totals.carbs}
          color="#10b981"
          onChange={(v) => overrideMacro('baseCarbsPer100', v)}
        />
        <MacroField
          label="Fat"
          unit="g"
          value={totals.fat}
          color="#f59e0b"
          onChange={(v) => overrideMacro('baseFatPer100', v)}
        />
      </div>
    </div>
  )
}
