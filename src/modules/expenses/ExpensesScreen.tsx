import { Wallet, Plus, PieChart, Target } from 'lucide-react'
import PlaceholderScreen from '@/components/PlaceholderScreen'

const FEATURES = [
  { icon: Wallet, label: 'Log income & expenses' },
  { icon: PieChart, label: 'Spending by category' },
  { icon: Target, label: 'Monthly budgets' },
]

export default function ExpensesScreen() {
  return (
    <PlaceholderScreen
      accentColor="#10b981"
      icon={Wallet}
      module="Expense Tracker"
      phase="Phase 3"
      tagline="Every rupee tracked. Every budget respected."
      features={FEATURES}
      ctaIcon={Plus}
      ctaLabel="Add Transaction"
    />
  )
}
