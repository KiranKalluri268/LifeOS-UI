import { useOnline } from '@/hooks/useOnline'
import { WifiOff } from 'lucide-react'

/**
 * Slides in from the top when the device goes offline.
 * Disappears automatically when back online.
 */
export default function OfflineBanner() {
  const isOnline = useOnline()

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 16px',
        pointerEvents: 'none',
        // Slide down when offline, slide up when online
        transform: isOnline ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: '#1a1a24',
          border: '1px solid rgba(239,68,68,0.4)',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 24px rgba(239,68,68,0.15)',
          pointerEvents: 'auto',
        }}
      >
        <WifiOff size={14} color="#ef4444" strokeWidth={2} />
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#ef4444',
            letterSpacing: '0.02em',
          }}
        >
          Offline — changes saved locally
        </span>
        {/* Pulsing dot */}
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#ef4444',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
