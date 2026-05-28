import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import OfflineBanner from './OfflineBanner'
import PWAPrompt from './PWAPrompt'

const MODULE_HEADERS: Record<string, { title: string; subtitle: string; color: string }> = {
  '/food': {
    title: 'LifeOS',
    subtitle: 'Food & Nutrition',
    color: '#f97316',
  },
  '/expenses': {
    title: 'LifeOS',
    subtitle: 'Expenses',
    color: '#10b981',
  },
  '/time': {
    title: 'LifeOS',
    subtitle: 'Time & Sleep',
    color: '#3b82f6',
  },
  '/insights': {
    title: 'LifeOS',
    subtitle: 'Insights',
    color: '#8b5cf6',
  },
}

export default function AppShell() {
  const location = useLocation()
  const moduleKey = `/${location.pathname.split('/')[1]}`
  const header = MODULE_HEADERS[moduleKey] ?? MODULE_HEADERS['/food']

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        background: '#0f0f14',
        maxWidth: '480px',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* ── Top header ─────────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          padding: '16px 20px 12px',
          paddingTop: 'calc(16px + env(safe-area-inset-top))',
          background: 'rgba(15,15,20,0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${header.color}00, ${header.color}, ${header.color}00)`,
            transition: 'background 0.3s ease',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span
            style={{
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              backgroundImage: `linear-gradient(135deg, #f1f0f7, ${header.color})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              transition: 'background-image 0.3s ease',
            }}
          >
            {header.title}
          </span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#6b6884',
              letterSpacing: '0.01em',
            }}
          >
            {header.subtitle}
          </span>
        </div>
      </header>

      {/* ── Screen content ─────────────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: '88px', // clear bottom nav (64px + 24px breathing room)
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Outlet />
      </main>

      {/* ── Bottom navigation ──────────────────────────────────────────────── */}
      <BottomNav />

      {/* ── Global overlays ───────────────────────────────────────────────── */}
      <OfflineBanner />
      <PWAPrompt />
    </div>
  )
}
