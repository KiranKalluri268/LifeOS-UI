import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { Share, Download, Check } from 'lucide-react'
import type { WeeklyDigestData } from '../insights.types'

export default function WeeklyDigest({ digest }: { digest: WeeklyDigestData }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    if (!cardRef.current) return
    setIsSharing(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#13111c',
        scale: 2,
        logging: false,
      })
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('Canvas to Blob failed')

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'lifeos-weekly.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'LifeOS Weekly Digest',
            files: [file]
          })
          setShared(true)
          setTimeout(() => setShared(false), 2000)
          return
        }
      }

      // Fallback: download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lifeos-weekly-${new Date().toISOString().slice(0, 10)}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch (err) {
      console.error('Share failed:', err)
    } finally {
      setIsSharing(false)
    }
  }

  const {
    avgCaloriesPerDay, daysWithFoodLogged, avgProtein,
    totalSpend, totalIncome, topCategoryName, topCategoryColor,
    totalTrackedHours, deepWorkHours, avgSleepHours, sleepNightsLogged
  } = digest

  return (
    <div>
      <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Weekly Digest
        </div>
        <button
          onClick={handleShare}
          disabled={isSharing}
          style={{
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '999px',
            padding: '6px 12px',
            color: '#3b82f6',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          {shared ? <Check size={14} /> : ((typeof navigator.share === 'function') ? <Share size={14} /> : <Download size={14} />)}
          {shared ? 'Saved!' : 'Share'}
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div
          ref={cardRef}
          style={{
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.07)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#f1f0f7', letterSpacing: '-0.02em' }}>LifeOS Digest</span>
            <span style={{ fontSize: '12px', color: '#6b6884' }}>Last 7 Days</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Food */}
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.15)' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', marginBottom: '8px' }}>Food</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#f1f0f7' }}>{avgCaloriesPerDay.toLocaleString()} <span style={{ fontSize: '11px', color: '#6b6884', fontWeight: 500 }}>kcal/day</span></div>
              <div style={{ fontSize: '11px', color: '#a09db8', marginTop: '4px' }}>{avgProtein}g protein avg</div>
              <div style={{ fontSize: '10px', color: '#6b6884', marginTop: '2px' }}>{daysWithFoodLogged}/7 days tracked</div>
            </div>

            {/* Expenses */}
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: '8px' }}>Expenses</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#f1f0f7' }}>₹{Math.round(totalSpend).toLocaleString()} <span style={{ fontSize: '11px', color: '#6b6884', fontWeight: 500 }}>spent</span></div>
              <div style={{ fontSize: '11px', color: '#a09db8', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Top: <span style={{ color: topCategoryColor }}>{topCategoryName}</span>
              </div>
              <div style={{ fontSize: '10px', color: '#6b6884', marginTop: '2px' }}>₹{Math.round(totalIncome).toLocaleString()} income</div>
            </div>

            {/* Time */}
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', marginBottom: '8px' }}>Time</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#f1f0f7' }}>{totalTrackedHours}h <span style={{ fontSize: '11px', color: '#6b6884', fontWeight: 500 }}>tracked</span></div>
              <div style={{ fontSize: '11px', color: '#a09db8', marginTop: '4px' }}>{deepWorkHours}h deep work</div>
            </div>

            {/* Sleep */}
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: '8px' }}>Sleep</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#f1f0f7' }}>{avgSleepHours}h <span style={{ fontSize: '11px', color: '#6b6884', fontWeight: 500 }}>/ night</span></div>
              <div style={{ fontSize: '11px', color: '#a09db8', marginTop: '4px' }}>{sleepNightsLogged}/7 nights logged</div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', fontSize: '10px', color: '#4a4869', marginTop: '4px' }}>
            LifeTrack OS • {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}
