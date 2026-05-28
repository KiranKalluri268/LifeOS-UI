import { useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Shows a toast when a new service worker version is ready.
 * User can dismiss or reload to apply the update.
 */
export default function PWAPrompt() {
  const [dismissed, setDismissed] = useState(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.info('[PWA] Service worker registered:', r)
    },
    onRegisterError(error) {
      console.error('[PWA] Service worker registration failed:', error)
    },
  })

  if (!needRefresh || dismissed) return null

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: '80px', // above bottom nav
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        width: 'calc(100% - 32px)',
        maxWidth: '440px',
        background: 'rgba(22,22,31,0.95)',
        border: '1px solid rgba(124,58,237,0.4)',
        borderRadius: '14px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(124,58,237,0.2)',
        animation: 'slideUp 0.3s ease',
      }}
    >
      <RefreshCw size={18} color="#7c3aed" strokeWidth={2} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: '13px', color: '#c4c0da', lineHeight: 1.4 }}>
        New version available — reload to update
      </span>
      <button
        onClick={() => { void updateServiceWorker(true) }}
        style={{
          padding: '6px 12px',
          borderRadius: '8px',
          background: '#7c3aed',
          border: 'none',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          flexShrink: 0,
        }}
      >
        Reload
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss update notification"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          color: '#6b6884',
          display: 'flex',
          flexShrink: 0,
        }}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
