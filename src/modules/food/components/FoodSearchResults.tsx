import { Loader2, Search, Flame, AlertCircle } from 'lucide-react'
import type { OFFSearchResult } from '../food.types'

interface FoodSearchResultsProps {
  results: OFFSearchResult[]
  isLoading: boolean
  error: string | null
  query: string
  onSelect: (result: OFFSearchResult) => void
  onManualEntry: () => void
}

function MacroChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span
      style={{
        fontSize: '11px',
        color,
        background: `${color}18`,
        padding: '2px 6px',
        borderRadius: '4px',
        fontWeight: 500,
      }}
    >
      {label} {value}g
    </span>
  )
}

export default function FoodSearchResults({
  results,
  isLoading,
  error,
  query,
  onSelect,
  onManualEntry,
}: FoodSearchResultsProps) {
  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '32px 0', color: '#a09db8' }}>
        <Loader2 size={18} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '14px' }}>Searching Open Food Facts…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <AlertCircle size={24} color="#ef4444" style={{ margin: '0 auto 8px' }} />
        <p style={{ fontSize: '13px', color: '#ef4444', marginBottom: '12px' }}>{error}</p>
        <button onClick={onManualEntry} style={manualBtnStyle}>Enter manually instead</button>
      </div>
    )
  }

  // Empty (query too short)
  if (query.trim().length < 2) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center' }}>
        <Search size={32} color="#3a3852" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontSize: '13px', color: '#6b6884' }}>Type at least 2 characters to search</p>
      </div>
    )
  }

  // No results
  if (results.length === 0) {
    return (
      <div style={{ padding: '24px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#a09db8', marginBottom: '4px' }}>No results for "{query}"</p>
        <p style={{ fontSize: '12px', color: '#6b6884', marginBottom: '16px' }}>Try a shorter term or enter manually</p>
        <button onClick={onManualEntry} style={manualBtnStyle}>Enter manually</button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {results.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelect(r)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            fontFamily: 'inherit',
            transition: 'background 0.1s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          {/* Product image or placeholder */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.2)',
              flexShrink: 0,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {r.imageUrl ? (
              <img src={r.imageUrl} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Flame size={18} color="#f97316" strokeWidth={1.5} />
            )}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#f1f0f7', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.name}
            </p>
            {r.brand && (
              <p style={{ fontSize: '11px', color: '#6b6884', marginBottom: '5px' }}>{r.brand}</p>
            )}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: '#f97316', fontWeight: 600 }}>
                {r.calories} kcal
              </span>
              <span style={{ color: '#3a3852', fontSize: '11px' }}>·</span>
              <MacroChip label="P" value={r.protein} color="#3b82f6" />
              <MacroChip label="C" value={r.carbs}   color="#10b981" />
              <MacroChip label="F" value={r.fat}     color="#f59e0b" />
              <span style={{ fontSize: '10px', color: '#6b6884', alignSelf: 'center' }}>per 100g</span>
            </div>
          </div>
        </button>
      ))}

      {/* Manual entry option at bottom */}
      <div style={{ padding: '12px 20px' }}>
        <button onClick={onManualEntry} style={manualBtnStyle}>
          ✏️ None of these — enter manually
        </button>
      </div>
    </div>
  )
}

const manualBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#a09db8',
  fontSize: '13px',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
