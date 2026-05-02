import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function ProtectedRoute() {
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthenticated(!!user)
      setChecking(false)
    })
    return unsub
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />
}
