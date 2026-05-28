import { NavLink, useLocation } from 'react-router-dom'
import { UtensilsCrossed, Wallet, Timer, Sparkles } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: React.ElementType
  activeColor: string
  glowColor: string
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/food',
    label: 'Food',
    icon: UtensilsCrossed,
    activeColor: '#f97316',
    glowColor: 'rgba(249,115,22,0.25)',
  },
  {
    to: '/expenses',
    label: 'Expenses',
    icon: Wallet,
    activeColor: '#10b981',
    glowColor: 'rgba(16,185,129,0.25)',
  },
  {
    to: '/time',
    label: 'Time',
    icon: Timer,
    activeColor: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.25)',
  },
  {
    to: '/insights',
    label: 'Insights',
    icon: Sparkles,
    activeColor: '#8b5cf6',
    glowColor: 'rgba(139,92,246,0.25)',
  },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'rgba(15, 15, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          height: '64px',
          maxWidth: '480px',
          margin: '0 auto',
          padding: '0 8px',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.to)
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                textDecoration: 'none',
                borderRadius: '12px',
                margin: '8px 2px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                background: isActive ? item.glowColor : 'transparent',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  style={{
                    color: isActive ? item.activeColor : '#6b6884',
                    transition: 'all 0.2s ease',
                    filter: isActive
                      ? `drop-shadow(0 0 6px ${item.activeColor}80)`
                      : 'none',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: '0.02em',
                  color: isActive ? item.activeColor : '#6b6884',
                  transition: 'all 0.2s ease',
                  lineHeight: 1,
                }}
              >
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
