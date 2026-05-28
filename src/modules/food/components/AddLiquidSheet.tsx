import { useState } from 'react'
import { Droplets, Coffee, Leaf, Apple, Wine, Plus, Check } from 'lucide-react'
import BottomSheet from '@/components/BottomSheet'
import { db } from '@/db'
import type { LiquidType } from '@/db/types'

interface LiquidOption {
  type: LiquidType
  label: string
  icon: React.ElementType
  color: string
  emoji: string
}

const LIQUID_OPTIONS: LiquidOption[] = [
  { type: 'water',   label: 'Water',   icon: Droplets, color: '#3b82f6', emoji: '💧' },
  { type: 'coffee',  label: 'Coffee',  icon: Coffee,   color: '#92400e', emoji: '☕' },
  { type: 'tea',     label: 'Tea',     icon: Leaf,     color: '#16a34a', emoji: '🍵' },
  { type: 'juice',   label: 'Juice',   icon: Apple,    color: '#f59e0b', emoji: '🍊' },
  { type: 'alcohol', label: 'Alcohol', icon: Wine,     color: '#7c3aed', emoji: '🍷' },
  { type: 'other',   label: 'Other',   icon: Plus,     color: '#6b7280', emoji: '🥤' },
]

const QUICK_ADD_ML = [150, 250, 350, 500] as const

interface AddLiquidSheetProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

export default function AddLiquidSheet({ isOpen, onClose, onSaved }: AddLiquidSheetProps) {
  const [liquidType, setLiquidType] = useState<LiquidType>('water')
  const [amountMl, setAmountMl] = useState(250)
  const [isSaving, setIsSaving] = useState(false)

  const activeOption = LIQUID_OPTIONS.find((o) => o.type === liquidType)!

  const handleSave = async () => {
    if (amountMl <= 0) return
    setIsSaving(true)
    try {
      const now = new Date().toISOString()
      await db.liquid_logs.add({
        userId: 'local',
        date: now.slice(0, 10),
        liquidType,
        amountMl,
        syncStatus: 'pending',
        createdAt: now,
      })
      onSaved()
      onClose()
      // Reset for next open
      setAmountMl(250)
    } catch (err) {
      console.error('Failed to save liquid log:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Log Drink"
      accentColor="#3b82f6"
    >
      <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Liquid type selector */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {LIQUID_OPTIONS.map((opt) => {
            const isActive = liquidType === opt.type
            const Icon = opt.icon
            return (
              <button
                key={opt.type}
                onClick={() => setLiquidType(opt.type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: `1.5px solid ${isActive ? opt.color : 'rgba(255,255,255,0.08)'}`,
                  background: isActive ? `${opt.color}20` : 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} color={isActive ? opt.color : '#6b6884'} strokeWidth={2} />
                <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400, color: isActive ? opt.color : '#a09db8' }}>
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Big amount display */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 16px',
            borderRadius: '16px',
            background: `${activeOption.color}10`,
            border: `1px solid ${activeOption.color}25`,
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '48px', lineHeight: 1 }}>{activeOption.emoji}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <input
              type="number"
              min={1}
              max={2000}
              value={amountMl}
              onChange={(e) => setAmountMl(Math.max(1, parseInt(e.target.value) || 0))}
              style={{
                width: '120px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                textAlign: 'center',
                fontSize: '52px',
                fontWeight: 800,
                color: activeOption.color,
                fontFamily: 'inherit',
                MozAppearance: 'textfield',
              }}
            />
            <span style={{ fontSize: '22px', fontWeight: 600, color: '#6b6884' }}>ml</span>
          </div>
        </div>

        {/* Quick-add presets */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            Quick add
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {QUICK_ADD_ML.map((ml) => (
              <button
                key={ml}
                onClick={() => setAmountMl((prev) => prev + ml)}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  borderRadius: '10px',
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  color: '#60a5fa',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.15)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.08)' }}
              >
                +{ml}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isSaving || amountMl <= 0}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '14px',
            background: `linear-gradient(135deg, ${activeOption.color}, ${activeOption.color}cc)`,
            border: 'none',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'inherit',
          }}
        >
          <Check size={18} strokeWidth={2.5} />
          {isSaving ? 'Saving…' : `Log ${amountMl}ml ${activeOption.label}`}
        </button>
      </div>
    </BottomSheet>
  )
}
