import { Outlet } from 'react-router'

const STATS = [
  { value: '500+', label: 'Clinics' },
  { value: '2M+', label: 'Patients' },
  { value: '99.9%', label: 'Uptime' },
]

const BADGES = ['HIPAA Compliant', 'SOC 2 Type II', 'ISO 27001']

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  )
}

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a1 1 0 011 1v3h3a1 1 0 010 2h-3v3a1 1 0 01-2 0v-3H8a1 1 0 010-2h3V7a1 1 0 011-1z" />
    </svg>
  )
}

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-blue-700 flex-col p-10 relative overflow-hidden shrink-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600 opacity-40" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-blue-900 opacity-30" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <CrossIcon className="w-6 h-6 text-blue-700" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">RagaHealth</span>
        </div>

        {/* Hero */}
        <div className="relative mt-auto mb-10">
          <h2 className="text-white text-3xl font-bold leading-snug mb-4">
            Intelligent Healthcare Analytics Platform
          </h2>
          <p className="text-blue-200 text-base leading-relaxed">
            Streamline clinical workflows, reduce administrative burden, and improve patient outcomes with AI-powered insights.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {STATS.map(({ value, label }) => (
              <div key={label} className="bg-blue-600/50 rounded-xl p-4">
                <div className="text-white text-2xl font-bold">{value}</div>
                <div className="text-blue-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="relative flex flex-wrap gap-2">
          {BADGES.map((badge) => (
            <span
              key={badge}
              className="flex items-center gap-1.5 bg-blue-600/50 text-blue-100 text-xs px-3 py-1.5 rounded-full"
            >
              <ShieldIcon className="w-3 h-3" />
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <Outlet />
      </div>
    </div>
  )
}
