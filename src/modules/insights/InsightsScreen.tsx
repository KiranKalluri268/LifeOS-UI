import { Sparkles, TrendingUp, Brain, Share2 } from 'lucide-react'
import PlaceholderScreen from '@/components/PlaceholderScreen'

const FEATURES = [
  { icon: TrendingUp, label: 'Cross-domain correlations' },
  { icon: Brain, label: 'AI-style weekly digest' },
  { icon: Share2, label: 'Shareable reports' },
]

export default function InsightsScreen() {
  return (
    <PlaceholderScreen
      accentColor="#8b5cf6"
      icon={Sparkles}
      module="Insights"
      phase="Phase 5"
      tagline="See how your food, money, and time connect."
      features={FEATURES}
      ctaIcon={Sparkles}
      ctaLabel="View Insights"
    />
  )
}
