import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import FoodScreen from '@/modules/food/FoodScreen'
import ExpensesScreen from '@/modules/expenses/ExpensesScreen'
import TimeScreen from '@/modules/time/TimeScreen'
import InsightsScreen from '@/modules/insights/InsightsScreen'
import AuthScreen from '@/modules/auth/AuthScreen'
import { useSyncEngine } from '@/hooks/useSyncEngine'

function AuthenticatedApp() {
  useSyncEngine()
  
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/food" replace />} />
        <Route path="food" element={<FoodScreen />} />
        <Route path="expenses" element={<ExpensesScreen />} />
        <Route path="time" element={<TimeScreen />} />
        <Route path="insights" element={<InsightsScreen />} />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/food" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setIsAuthenticated(true)
  }, [])

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />
  }

  return <AuthenticatedApp />
}
