import { useState } from 'react'

const API_URL = 'http://localhost:3001/api/auth'

export default function AuthScreen({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const endpoint = isLogin ? '/login' : '/register'
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      localStorage.setItem('token', data.token)
      onAuthSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d0b14',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#13111c',
        borderRadius: '24px',
        padding: '32px 24px',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚀</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f1f0f7', margin: 0 }}>LifeTrack OS</h1>
          <p style={{ color: '#6b6884', fontSize: '14px', marginTop: '4px' }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#f1f0f7', fontSize: '15px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6b6884', textTransform: 'uppercase', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#f1f0f7', fontSize: '15px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '13px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: 'none', color: '#fff', fontSize: '15px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
              opacity: loading ? 0.7 : 1, transition: 'all 0.2s'
            }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(null) }}
            style={{ background: 'none', border: 'none', color: '#a09db8', fontSize: '14px', cursor: 'pointer' }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  )
}
