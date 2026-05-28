import { Timer, Play, Moon, LayoutGrid } from 'lucide-react'
import PlaceholderScreen from '@/components/PlaceholderScreen'

const FEATURES = [
  { icon: Play, label: 'Live activity timer' },
  { icon: Moon, label: 'Sleep logging & quality' },
  { icon: LayoutGrid, label: 'Daily timeline view' },
]

export default function TimeScreen() {
  return (
    <PlaceholderScreen
      accentColor="#3b82f6"
      icon={Timer}
      module="Time & Sleep"
      phase="Phase 4"
      tagline="Time your focus, track your rest, own your day."
      features={FEATURES}
      ctaIcon={Play}
      ctaLabel="Start Timer"
    />
  )
}
