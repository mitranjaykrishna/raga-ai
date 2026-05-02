import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { HiEye, HiEyeOff, HiInformationCircle } from 'react-icons/hi'
import { auth } from '../lib/firebase'
import GoogleIcon from '../components/GoogleIcon'

const ROLES = [
  'Physician / Doctor',
  'Nurse Practitioner',
  'Healthcare Administrator',
  'Clinical Director',
  'IT / Health Informatics',
  'Practice Manager',
  'Other',
]

const inputCls =
  'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white'

export default function Signup() {
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate('/dashboard', { replace: true })
    })
    return unsub
  }, [navigate])

  const [firstName, setFirstName]   = useState('')
  const [lastName, setLastName]     = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [organization, setOrganization] = useState('')
  const [role, setRole]             = useState('')
  const [agreed, setAgreed]         = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      navigate('/dashboard')
    } catch {
      setError('Google sign-up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!agreed) { setError('Please accept the terms to continue.'); return }
    setError('')
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName: `${firstName} ${lastName}` })
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists.')
        else if (err.code === 'auth/weak-password') setError('Password must be at least 6 characters.')
        else setError('Sign-up failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
      <p className="text-gray-500 text-sm mb-6">Start your 14-day free trial. No credit card required.</p>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
          <HiInformationCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" required className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" required className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Work email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@clinic.com" required className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              className={`${inputCls} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Organization</label>
          <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="City Medical Center" required className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Your role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required className={inputCls}>
            <option value="">Select your role</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
          />
          <span className="text-xs text-gray-500 leading-relaxed">
            I agree to the{' '}
            <Link to="#" className="text-blue-600 hover:underline font-medium">Terms of Service</Link>
            {' '}and{' '}
            <Link to="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>
            , including the HIPAA Business Associate Agreement
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-400">
        Your data is protected under{' '}
        <span className="font-medium text-gray-500">HIPAA compliance standards</span>
      </p>
    </div>
  )
}
