import { useEffect, useRef, useState } from 'react'
import { X, Loader2, AlertCircle, Search } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { fetchProductByBarcode } from '../hooks/useFoodSearch'
import type { OFFSearchResult } from '../food.types'

interface BarcodeScannerProps {
  onScanSuccess: (result: OFFSearchResult) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const [permissionState, setPermissionState] = useState<'prompt' | 'loading' | 'granted' | 'denied'>('prompt')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')
  
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null)
  const isStoppingRef = useRef<boolean>(false)
  const scannerContainerId = 'barcode-scanner-view'

  useEffect(() => {
    // Lock scroll when scanner is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    let qrcodeInstance: Html5Qrcode | null = null

    const initScanner = async () => {
      setPermissionState('loading')
      try {
        qrcodeInstance = new Html5Qrcode(scannerContainerId)
        html5QrcodeRef.current = qrcodeInstance

        await qrcodeInstance.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: (width, height) => {
              // Barcodes are wide rectangles rather than squares
              const boxWidth = Math.min(width * 0.85, 280)
              const boxHeight = Math.min(height * 0.35, 130)
              return { width: boxWidth, height: boxHeight }
            },
            aspectRatio: 1.777778, // 16:9 aspect ratio
          },
          async (decodedText) => {
            // Found a barcode! Vibrate if supported
            if (navigator.vibrate) {
              try {
                navigator.vibrate(100)
              } catch (_) {}
            }
            
            // Auto stop camera
            await stopCamera()
            handleBarcodeLookup(decodedText)
          },
          () => {
            // Silent frame failures (standard html5-qrcode behavior)
          }
        )
        setPermissionState('granted')
      } catch (err: any) {
        console.error('Camera startup failed:', err)
        setPermissionState('denied')
        setErrorMessage(err?.message || 'Could not access the camera. Please verify camera permissions.')
      }
    }

    const stopCamera = async () => {
      if (qrcodeInstance && qrcodeInstance.isScanning && !isStoppingRef.current) {
        isStoppingRef.current = true
        try {
          await qrcodeInstance.stop()
        } catch (err) {
          console.error('Failed to stop camera stream:', err)
        } finally {
          isStoppingRef.current = false
        }
      }
    }

    // Delay start slightly to guarantee scanner target div is rendered in the DOM
    const delayTimer = setTimeout(() => {
      initScanner()
    }, 450)

    return () => {
      clearTimeout(delayTimer)
      stopCamera()
    }
  }, [])

  const handleBarcodeLookup = async (barcode: string) => {
    setIsLoadingProduct(true)
    setErrorMessage(null)
    try {
      const product = await fetchProductByBarcode(barcode)
      if (product) {
        onScanSuccess(product)
      } else {
        setErrorMessage(`Barcode "${barcode}" not found in Open Food Facts database.`)
      }
    } catch (err) {
      setErrorMessage('Lookup failed. Check network connection or try manually.')
    } finally {
      setIsLoadingProduct(false)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualBarcode.trim()) return
    handleBarcodeLookup(manualBarcode.trim())
  }

  // Pre-fill fields manually if product isn't found
  const handleLogManualWithBarcode = () => {
    // Create empty shell with the barcode
    const partialResult: OFFSearchResult = {
      id: manualBarcode.trim() || 'scanned',
      name: '',
      brand: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      servingSize: 100,
      servingUnit: 'g',
    }
    onScanSuccess(partialResult)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        background: '#0d0d12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#f1f0f7',
        fontFamily: 'inherit',
      }}
    >
      {/* Styles for scanning overlays */}
      <style>{`
        @keyframes scanLaser {
          0% { top: 6%; }
          50% { top: 94%; }
          100% { top: 6%; }
        }
        @keyframes pulseBorder {
          0%, 100% { border-color: rgba(249, 115, 22, 0.4); }
          50% { border-color: rgba(249, 115, 22, 1); }
        }
        #barcode-scanner-view video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'linear-gradient(to bottom, rgba(13,13,18,0.9), rgba(13,13,18,0))',
          position: 'absolute',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.3px' }}>Barcode Scanner</h2>
          <span style={{ fontSize: '11px', color: '#a09db8', marginTop: '2px' }}>Point camera at a barcode</span>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#f1f0f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          aria-label="Close scanner"
        >
          <X size={20} />
        </button>
      </div>

      {/* Camera View Area */}
      <div
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Viewfinder overlay */}
        {permissionState === 'granted' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Dark bounding box mask around scanning area */}
            <div
              style={{
                position: 'relative',
                width: 'min(85vw, 280px)',
                height: 'min(35vw, 130px)',
                boxShadow: '0 0 0 9999px rgba(13, 13, 18, 0.75)',
                borderRadius: '12px',
                animation: 'pulseBorder 2.5s infinite ease-in-out',
                border: '2px solid rgba(249, 115, 22, 0.6)',
              }}
            >
              {/* Corner brackets */}
              <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #f97316', borderLeft: '4px solid #f97316', borderTopLeftRadius: '8px' }} />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid #f97316', borderRight: '4px solid #f97316', borderTopRightRadius: '8px' }} />
              <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #f97316', borderLeft: '4px solid #f97316', borderBottomLeftRadius: '8px' }} />
              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #f97316', borderRight: '4px solid #f97316', borderBottomRightRadius: '8px' }} />

              {/* Laser animation */}
              <div
                style={{
                  position: 'absolute',
                  left: '4px',
                  right: '4px',
                  height: '2px',
                  background: 'linear-gradient(to right, transparent, #f97316, transparent)',
                  boxShadow: '0 0 8px #f97316',
                  animation: 'scanLaser 2.2s infinite ease-in-out',
                }}
              />
            </div>
          </div>
        )}

        {/* The video container */}
        <div
          id={scannerContainerId}
          style={{
            width: '100%',
            height: '100%',
            background: '#0d0d12',
          }}
        />

        {/* Loading and Error states overlaying the camera */}
        {permissionState === 'loading' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#0d0d12',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              zIndex: 8,
            }}
          >
            <Loader2 className="animate-spin" size={32} color="#f97316" />
            <span style={{ fontSize: '14px', color: '#a09db8' }}>Initializing camera...</span>
          </div>
        )}

        {permissionState === 'denied' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#0d0d12',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              textAlign: 'center',
              gap: '16px',
              zIndex: 8,
            }}
          >
            <AlertCircle size={40} color="#ef4444" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Camera Access Required</h3>
            <p style={{ fontSize: '13px', color: '#a09db8', maxWidth: '300px', margin: 0, lineHeight: 1.5 }}>
              We need camera permissions to scan barcodes. You can search by name or enter a barcode manually below instead.
            </p>
          </div>
        )}

        {/* Loading OFF Product API State */}
        {isLoadingProduct && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(13,13,18,0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              zIndex: 20,
            }}
          >
            <Loader2 className="animate-spin" size={36} color="#f97316" />
            <span style={{ fontSize: '15px', color: '#f1f0f7', fontWeight: 600 }}>Searching database...</span>
          </div>
        )}
      </div>

      {/* Bottom Panel — Manual barcode input and notifications */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'linear-gradient(to top, #16161f 85%, rgba(22,22,31,0.9))',
          padding: '24px 20px env(safe-area-inset-bottom)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 10,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '24px 24px 0 0',
        }}
      >
        {/* Error notification */}
        {errorMessage && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <div style={{ flex: 1 }}>
              <span>{errorMessage}</span>
              {errorMessage.includes('not found') && (
                <button
                  onClick={handleLogManualWithBarcode}
                  style={{
                    display: 'block',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#f97316',
                    fontWeight: 600,
                    fontSize: '12px',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginTop: '8px',
                    fontFamily: 'inherit',
                  }}
                >
                  Log empty item with this barcode
                </button>
              )}
            </div>
          </div>
        )}

        {/* Manual Barcode Input Form */}
        <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#a09db8' }}>
            Or enter barcode manually:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 12px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Search size={16} color="#6b6884" />
              <input
                type="text"
                placeholder="e.g. 5449000000996"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#f1f0f7',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingProduct || !manualBarcode.trim()}
              style={{
                padding: '0 20px',
                borderRadius: '12px',
                background: manualBarcode.trim() ? '#f97316' : 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: manualBarcode.trim() ? '#ffffff' : '#6b6884',
                fontSize: '14px',
                fontWeight: 600,
                cursor: manualBarcode.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              Look Up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
