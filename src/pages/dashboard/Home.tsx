import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchStats } from '../../store/slices/dashboardSlice'
import { fetchPatients } from '../../store/slices/patientsSlice'
import { auth } from '../../lib/firebase'
import type { Patient } from '../../lib/mockApi'

const STATUS_CLS: Record<Patient['status'], string> = {
  Active:   'bg-blue-50 text-blue-700',
  Critical: 'bg-red-50 text-red-700',
  Stable:   'bg-green-50 text-green-700',
}

const STAT_CONFIG = [
  {
    key: 'totalPatients' as const,
    label: 'Total Patients',
    change: '+12% this month',
    up: true,
    iconBg: 'bg-blue-600',
    icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    key: 'todayAppointments' as const,
    label: "Today's Appointments",
    change: '+3 from yesterday',
    up: true,
    iconBg: 'bg-green-600',
    icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  },
  {
    key: 'activeCases' as const,
    label: 'Active Cases',
    change: '12 need review',
    up: false,
    iconBg: 'bg-amber-500',
    icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
  {
    key: 'criticalAlerts' as const,
    label: 'Critical Alerts',
    change: '2 new today',
    up: false,
    iconBg: 'bg-red-600',
    icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  },
]

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
        <div className="w-24 h-6 bg-gray-200 rounded-full" />
      </div>
      <div className="w-16 h-8 bg-gray-200 rounded mb-2" />
      <div className="w-28 h-4 bg-gray-100 rounded" />
    </div>
  )
}

function RowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
          <div className="space-y-1.5">
            <div className="w-28 h-3.5 bg-gray-200 rounded animate-pulse" />
            <div className="w-12 h-3 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </td>
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-6 py-4">
          <div className="w-20 h-3.5 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

export default function DashboardHome() {
  const dispatch = useAppDispatch()
  const { stats, status: statsStatus, error: statsError } = useAppSelector((s) => s.dashboard)
  const { list: patients, status: patientsStatus, error: patientsError } = useAppSelector((s) => s.patients)

  const user = auth.currentUser
  const name = user?.displayName?.split(' ')[0] ?? 'Doctor'

  useEffect(() => {
    // only fetch if not already loaded — Redux caches between navigations
    if (statsStatus === 'idle') dispatch(fetchStats())
    if (patientsStatus === 'idle') dispatch(fetchPatients())
  }, [dispatch, statsStatus, patientsStatus])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {name}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">{today} · Here's what's happening today</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsStatus === 'loading' || statsStatus === 'idle'
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : statsStatus === 'failed'
          ? <p className="col-span-4 text-sm text-red-500">{statsError}</p>
          : STAT_CONFIG.map((cfg) => (
              <div key={cfg.key} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 ${cfg.iconBg} rounded-lg flex items-center justify-center`}>
                    {cfg.icon}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.up ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {cfg.change}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats![cfg.key].toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{cfg.label}</p>
              </div>
            ))}
      </div>

      {/* Patients table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Today's Patients</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            View all
          </button>
        </div>

        {patientsStatus === 'failed' && (
          <p className="px-6 py-4 text-sm text-red-500">{patientsError}</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Patient', 'ID', 'Condition', 'Status', 'Time'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {patientsStatus === 'loading' || patientsStatus === 'idle'
                ? Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
                : patients.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold shrink-0">
                            {p.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{p.name}</p>
                            <p className="text-xs text-gray-500">Age {p.age}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{p.id}</td>
                      <td className="px-6 py-4 text-gray-700">{p.condition}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CLS[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{p.time}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
