import { UtensilsCrossed, Plus, Droplets, BarChart3 } from 'lucide-react'
import PlaceholderScreen from '@/components/PlaceholderScreen'
import DbSmokeTest from '@/components/DbSmokeTest'

const FEATURES = [
  { icon: UtensilsCrossed, label: 'Log meals & snacks' },
  { icon: Droplets, label: 'Track hydration' },
  { icon: BarChart3, label: 'Macro breakdown' },
]

export default function FoodScreen() {
  return (
    <>
      {/* Phase 1 only — remove in Phase 2 */}
      <div style={{ padding: '16px 20px 0' }}>
        <DbSmokeTest />
      </div>

      <PlaceholderScreen
        accentColor="#f97316"
        icon={UtensilsCrossed}
        module="Food Tracker"
        phase="Phase 2"
        tagline="Log every meal, track macros, and scan barcodes."
        features={FEATURES}
        ctaIcon={Plus}
        ctaLabel="Log Food"
      />
    </>
  )
}
