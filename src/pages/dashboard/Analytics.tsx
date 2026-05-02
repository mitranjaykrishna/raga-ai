import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import {
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineExclamationCircle,
} from 'react-icons/hi'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchPatients } from '../../store/slices/patientsSlice'
import { mockApi, type MonthlyTrend, type DailyAppointments } from '../../lib/mockApi'

const CONDITION_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
]

const STATUS_COLORS: Record<string, string> = {
  Active:   '#3b82f6',
  Stable:   '#10b981',
  Critical: '#ef4444',
}

const KPI = [
  {
    label: 'Total Patients',
    value: '2,847',
    change: '+12%',
    up: true,
    sub: 'vs last month',
    iconBg: 'bg-blue-600',
    Icon: HiOutlineUsers,
  },
  {
    label: "Today's Appointments",
    value: '24',
    change: '+3',
    up: true,
    sub: 'vs yesterday',
    iconBg: 'bg-emerald-600',
    Icon: HiOutlineCalendar,
  },
  {
    label: 'Active Cases',
    value: '158',
    change: '-4%',
    up: false,
    sub: 'vs last week',
    iconBg: 'bg-amber-500',
    Icon: HiOutlineClipboardList,
  },
  {
    label: 'Critical Alerts',
    value: '3',
    change: '+1',
    up: false,
    sub: 'since yesterday',
    iconBg: 'bg-red-600',
    Icon: HiOutlineExclamationCircle,
  },
]

/* ─── Tooltip ────────────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="font-semibold text-gray-900">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-900">{payload[0].name}</p>
      <p className="text-gray-500">{payload[0].value} patients</p>
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────────── */
function ChartSkeleton({ h = 'h-64' }: { h?: string }) {
  return <div className={`${h} rounded-xl bg-gray-100 animate-pulse`} />
}

/* ─── Section wrapper ────────────────────────────────────────────── */
function Card({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function Analytics() {
  const dispatch = useAppDispatch()
  const { list: patients, status } = useAppSelector((s) => s.patients)

  const [monthlyTrend, setMonthlyTrend]       = useState<MonthlyTrend[]>([])
  const [dailyAppts, setDailyAppts]           = useState<DailyAppointments[]>([])
  const [trendLoading, setTrendLoading]       = useState(true)
  const [dailyLoading, setDailyLoading]       = useState(true)

  useEffect(() => {
    if (status === 'idle') dispatch(fetchPatients())
  }, [status, dispatch])

  useEffect(() => {
    mockApi.getMonthlyTrend().then((data) => { setMonthlyTrend(data); setTrendLoading(false) })
    mockApi.getAppointmentsByDay().then((data) => { setDailyAppts(data); setDailyLoading(false) })
  }, [])

  const isLoading = status === 'idle' || status === 'loading'

  /* Derive charts from live patient data */
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    patients.forEach((p) => { counts[p.status] = (counts[p.status] ?? 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      fill: STATUS_COLORS[name] ?? '#94a3b8',
    }))
  }, [patients])

  const conditionData = useMemo(() => {
    const counts: Record<string, number> = {}
    patients.forEach((p) => { counts[p.condition] = (counts[p.condition] ?? 0) + 1 })
    return Object.entries(counts)
      .map(([condition, count]) => ({ condition, count }))
      .sort((a, b) => b.count - a.count)
      .map((item, idx) => ({ ...item, fill: CONDITION_COLORS[idx % CONDITION_COLORS.length] }))
  }, [patients])

  const doctorData = useMemo(() => {
    const counts: Record<string, number> = {}
    patients.forEach((p) => { counts[p.doctor] = (counts[p.doctor] ?? 0) + 1 })
    return Object.entries(counts).map(([doctor, patients], idx) => ({
      doctor: doctor.replace('Dr. ', ''),
      patients,
      fill: CONDITION_COLORS[idx % CONDITION_COLORS.length],
    }))
  }, [patients])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Healthcare performance overview · Last 7 months</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI.map(({ label, value, change, up, sub, iconBg, Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}>
                {up ? <HiOutlineTrendingUp className="w-3 h-3" /> : <HiOutlineTrendingDown className="w-3 h-3" />}
                {change}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Patient trend + Appointments by day */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Patient & Appointment Trend" subtitle="Monthly overview — last 7 months" className="xl:col-span-2">
          {trendLoading ? <ChartSkeleton h="h-[240px]" /> : <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAppts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Area type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} fill="url(#gradPatients)" dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="appointments" stroke="#10b981" strokeWidth={2} fill="url(#gradAppts)" dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>}
        </Card>

        <Card title="Appointments by Day" subtitle="This week">
          {dailyLoading ? <ChartSkeleton h="h-[240px]" /> : <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailyAppts} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f1f5f9', radius: 4 }} />
              <Bar dataKey="count" name="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>}
        </Card>
      </div>

      {/* Status breakdown + Condition distribution + Doctor workload */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Status donut */}
        <Card title="Patient Status" subtitle="Live from patient records">
          {isLoading ? <ChartSkeleton /> : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  />
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {statusData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[entry.name] ?? '#94a3b8' }} />
                    <span className="text-gray-500">{entry.name}</span>
                    <span className="font-semibold text-gray-800">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Condition bar */}
        <Card title="Top Conditions" subtitle="Patient count by diagnosis">
          {isLoading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={conditionData} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="condition"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="count" name="patients" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Doctor workload */}
        <Card title="Doctor Workload" subtitle="Patients per physician">
          {isLoading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={doctorData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="doctor" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f1f5f9', radius: 4 }} />
                <Bar dataKey="patients" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Summary table */}
      <Card title="Period Summary" subtitle="Month-over-month performance">
        {trendLoading ? <ChartSkeleton h="h-40" /> : <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Month', 'New Patients', 'Appointments', 'Utilization', 'vs Prior Month'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-6 last:pr-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {monthlyTrend.map((row, i) => {
                const prior = monthlyTrend[i - 1]
                const delta = prior ? Math.round(((row.patients - prior.patients) / prior.patients) * 100) : null
                const util = Math.round((row.appointments / row.patients) * 100)
                return (
                  <tr key={row.month} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 pr-6 font-medium text-gray-900">{row.month}</td>
                    <td className="py-3 pr-6 text-gray-700">{row.patients.toLocaleString()}</td>
                    <td className="py-3 pr-6 text-gray-700">{row.appointments.toLocaleString()}</td>
                    <td className="py-3 pr-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[80px]">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${util}%` }} />
                        </div>
                        <span className="text-gray-600 text-xs">{util}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      {delta === null ? (
                        <span className="text-gray-400 text-xs">—</span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}>
                          {delta >= 0
                            ? <HiOutlineTrendingUp className="w-3 h-3" />
                            : <HiOutlineTrendingDown className="w-3 h-3" />}
                          {delta >= 0 ? '+' : ''}{delta}%
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>}
      </Card>
    </div>
  )
}
