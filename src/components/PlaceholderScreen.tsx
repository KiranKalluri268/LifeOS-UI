import type { LucideIcon } from 'lucide-react'
import { CheckCircle } from 'lucide-react'

interface Feature {
  icon: LucideIcon
  label: string
}

interface PlaceholderScreenProps {
  accentColor: string
  icon: LucideIcon
  module: string
  phase: string
  tagline: string
  features: Feature[]
  ctaIcon: LucideIcon
  ctaLabel: string
}

export default function PlaceholderScreen({
  accentColor,
  icon: Icon,
  module,
  phase,
  tagline,
  features,
  ctaIcon: CtaIcon,
  ctaLabel,
}: PlaceholderScreenProps) {
  const dimAccent = `${accentColor}20`
  const midAccent = `${accentColor}40`

  return (
    <div
      style={{
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        minHeight: '100%',
      }}
    >
      {/* ── Hero card ────────────────────────────────────────────────────── */}
      <div
        style={{
          borderRadius: '20px',
          padding: '32px 24px',
          background: `linear-gradient(145deg, ${dimAccent}, rgba(22,22,31,0.8))`,
          border: `1px solid ${midAccent}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Icon ring */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
            border: `1.5px solid ${accentColor}50`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Icon size={34} color={accentColor} strokeWidth={1.75} />
        </div>

        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: `${accentColor}20`,
              border: `1px solid ${accentColor}40`,
              borderRadius: '999px',
              padding: '3px 10px',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, color: accentColor, letterSpacing: '0.05em' }}>
              {phase}
            </span>
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#f1f0f7',
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              marginBottom: '8px',
            }}
          >
            {module}
          </h1>
          <p style={{ fontSize: '14px', color: '#a09db8', lineHeight: 1.6, maxWidth: '260px' }}>
            {tagline}
          </p>
        </div>
      </div>

      {/* ── Feature list ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#6b6884',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '2px',
          }}
        >
          Coming in this module
        </p>
        {features.map((f) => {
          const FIcon = f.icon
          return (
            <div
              key={f.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(22,22,31,0.7)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: dimAccent,
                  border: `1px solid ${midAccent}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FIcon size={18} color={accentColor} strokeWidth={1.75} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#c4c0da' }}>{f.label}</span>
              <CheckCircle
                size={16}
                color={accentColor}
                strokeWidth={2}
                style={{ marginLeft: 'auto', opacity: 0.5, flexShrink: 0 }}
              />
            </div>
          )
        })}
      </div>

      {/* ── CTA button (disabled in placeholder) ─────────────────────────── */}
      <button
        disabled
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '14px',
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'not-allowed',
          opacity: 0.4,
          fontSize: '15px',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '0.02em',
          fontFamily: 'inherit',
        }}
      >
        <CtaIcon size={18} strokeWidth={2.5} />
        {ctaLabel}
      </button>

      <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b6884' }}>
        🚧 Under construction — shell is live, module coming soon
      </p>
    </div>
  )
}
