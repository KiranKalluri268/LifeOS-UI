import { useState } from 'react'
import { Plus, Droplets } from 'lucide-react'
import AddFoodSheet from './components/AddFoodSheet'
import AddLiquidSheet from './components/AddLiquidSheet'
import DailySummaryCard from './components/DailySummaryCard'
import FoodLogList from './components/FoodLogList'
import { useDailyLiquids } from './hooks/useDailyLiquids'
import { useDailyFoodLog } from './hooks/useDailyFoodLog'

export default function FoodScreen() {
  const [foodSheetOpen, setFoodSheetOpen] = useState(false)
  const [liquidSheetOpen, setLiquidSheetOpen] = useState(false)

  const liquidSummary = useDailyLiquids()
  const foodSummary   = useDailyFoodLog()

  return (
    <div style={{ minHeight: '100%', position: 'relative', paddingBottom: '100px' }}>

      {/* ── Daily summary card (hero) ────────────────────────────────────── */}
      <div style={{ padding: '16px 16px 8px' }}>
        <DailySummaryCard
          foodSummary={foodSummary}
          liquidSummary={liquidSummary}
          onAddLiquid={() => setLiquidSheetOpen(true)}
        />
      </div>

      {/* ── Food log list (live) ─────────────────────────────────────────── */}
      <FoodLogList
        groups={foodSummary.groups}
        totalCalories={foodSummary.totalCalories}
        entryCount={foodSummary.entryCount}
      />

      {/* ── FABs ────────────────────────────────────────────────────────── */}
      <button
        id="add-liquid-fab"
        onClick={() => setLiquidSheetOpen(true)}
        aria-label="Log a drink"
        style={{
          position: 'fixed',
          bottom: '152px',
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
        onSaved={() => setFoodSheetOpen(false)}
      />
      <AddLiquidSheet
        isOpen={liquidSheetOpen}
        onClose={() => setLiquidSheetOpen(false)}
        onSaved={() => setLiquidSheetOpen(false)}
      />
    </div>
  )
}
