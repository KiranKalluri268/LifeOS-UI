import { useState } from 'react'
import { Plus, Droplets } from 'lucide-react'
import AddFoodSheet from './components/AddFoodSheet'
import AddLiquidSheet from './components/AddLiquidSheet'
import HydrationBar from './components/HydrationBar'
import { useDailyLiquids } from './hooks/useDailyLiquids'

export default function FoodScreen() {
  const [foodSheetOpen, setFoodSheetOpen] = useState(false)
  const [liquidSheetOpen, setLiquidSheetOpen] = useState(false)

  const liquidSummary = useDailyLiquids()

  return (
    <div style={{ minHeight: '100%', position: 'relative', paddingBottom: '24px' }}>

      {/* ── Hydration bar (always at top) ───────────────────────────────── */}
      <div style={{ padding: '16px 20px 0' }}>
        <HydrationBar
          summary={liquidSummary}
          onAdd={() => setLiquidSheetOpen(true)}
        />
      </div>

      {/* ── Food log placeholder (replaced in Stage 2d) ──────────────────── */}
      <div
        style={{
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: '12px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
          }}
        >
          🍽️
        </div>
        <p style={{ fontSize: '18px', fontWeight: 700, color: '#f1f0f7' }}>
          Nothing logged yet
        </p>
        <p style={{ fontSize: '13px', color: '#6b6884', maxWidth: '220px', lineHeight: 1.5 }}>
          Tap <strong style={{ color: '#f97316' }}>+</strong> to log food or{' '}
          <strong style={{ color: '#3b82f6' }}>💧</strong> for a drink
        </p>
      </div>

      {/* ── FABs ────────────────────────────────────────────────────────── */}
      {/* Water FAB */}
      <button
        id="add-liquid-fab"
        onClick={() => setLiquidSheetOpen(true)}
        aria-label="Log a drink"
        style={{
          position: 'fixed',
          bottom: '148px', // stacked above food FAB
          right: '20px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
          transition: 'transform 0.15s ease',
          zIndex: 49,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
      >
        <Droplets size={20} color="#fff" strokeWidth={2} />
      </button>

      {/* Food FAB */}
      <button
        id="add-food-fab"
        onClick={() => setFoodSheetOpen(true)}
        aria-label="Add food entry"
        style={{
          position: 'fixed',
          bottom: '88px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          zIndex: 49,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(249,115,22,0.55)'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(249,115,22,0.4)'
        }}
      >
        <Plus size={24} color="#fff" strokeWidth={2.5} />
      </button>

      {/* ── Sheets ──────────────────────────────────────────────────────── */}
      <AddFoodSheet
        isOpen={foodSheetOpen}
        onClose={() => setFoodSheetOpen(false)}
        onSaved={() => console.info('[FoodScreen] food entry saved')}
      />
      <AddLiquidSheet
        isOpen={liquidSheetOpen}
        onClose={() => setLiquidSheetOpen(false)}
        onSaved={() => console.info('[FoodScreen] liquid entry saved')}
      />
    </div>
  )
}
