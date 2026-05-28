import { useEffect, useRef } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  accentColor?: string
  children: React.ReactNode
}

/**
 * Reusable animated bottom sheet.
 * Slides up from bottom, backdrop dismisses on tap.
 * Used by Food, Expenses, and Time modules.
 */
export default function BottomSheet({
  isOpen,
  onClose,
  title,
  accentColor = '#7c3aed',
  children,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 61,
          maxWidth: '480px',
          margin: '0 auto',
          background: '#16161f',
          borderRadius: '20px 20px 0 0',
          border: '1px solid rgba(255,255,255,0.07)',
          borderBottom: 'none',
          paddingBottom: 'env(safe-area-inset-bottom)',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          maxHeight: '92dvh',
          display: 'flex',
          flexDirection: 'column',
          // Accent line at top of sheet
          boxShadow: `0 -4px 40px rgba(0,0,0,0.5), 0 -1px 0 ${accentColor}40`,
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div
            style={{
              width: '36px',
              height: '4px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.12)',
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 20px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h2
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: '#f1f0f7',
              letterSpacing: '-0.2px',
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a09db8',
              fontSize: '18px',
              lineHeight: 1,
              fontFamily: 'inherit',
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
