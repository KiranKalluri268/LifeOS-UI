import { useState } from 'react'
import { Plus, Target } from 'lucide-react'
import AddTransactionSheet from './components/AddTransactionSheet'
import BudgetSheet from './components/BudgetSheet'
import TransactionList from './components/TransactionList'
import ExpenseSummaryCard from './components/ExpenseSummaryCard'
import { useMonthlyTransactions } from './hooks/useMonthlyTransactions'
import { useCategoryMap } from './hooks/useCategories'

export default function ExpensesScreen() {
  const [addSheetOpen, setAddSheetOpen]       = useState(false)
  const [budgetSheetOpen, setBudgetSheetOpen] = useState(false)

  const { groups, totals, entryCount } = useMonthlyTransactions()
  const categoryMap = useCategoryMap()

  return (
    <div style={{ minHeight: '100%', position: 'relative', paddingBottom: '100px' }}>

      {/* ── Summary card ─────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 16px 0' }}>
        <ExpenseSummaryCard totals={totals} categoryMap={categoryMap} />
      </div>

      {/* ── Budget shortcut bar ───────────────────────────────────────────── */}
      <div style={{ padding: '12px 16px 4px' }}>
        <button
          id="open-budgets-btn"
          onClick={() => setBudgetSheetOpen(true)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(16,185,129,0.07)',
            border: '1px solid rgba(16,185,129,0.18)',
            color: '#10b981',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'inherit',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.12)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.07)' }}
        >
          <Target size={15} strokeWidth={2.5} />
          Manage Monthly Budgets
        </button>
      </div>

      {/* ── Transaction list ─────────────────────────────────────────────── */}
      <div style={{ paddingTop: '8px' }}>
        <TransactionList
          groups={groups}
          entryCount={entryCount}
          categoryMap={categoryMap}
        />
      </div>

      {/* ── FAB ──────────────────────────────────────────────────────────── */}
      <button
        id="add-transaction-fab"
        onClick={() => setAddSheetOpen(true)}
        aria-label="Add transaction"
        style={{
          position: 'fixed',
          bottom: '88px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(16,185,129,0.45)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          zIndex: 49,
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(16,185,129,0.6)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(16,185,129,0.45)'
        }}
      >
        <Plus size={24} color="#fff" strokeWidth={2.5} />
      </button>

      {/* ── Sheets ───────────────────────────────────────────────────────── */}
      <AddTransactionSheet
        isOpen={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onSaved={() => setAddSheetOpen(false)}
      />
      <BudgetSheet
        isOpen={budgetSheetOpen}
        onClose={() => setBudgetSheetOpen(false)}
        spentByCategory={totals.byCategory}
      />
    </div>
  )
}
