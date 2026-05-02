import { NavLink, Outlet, useNavigate } from 'react-router'
import { signOut } from 'firebase/auth'
import {
  HiOutlineHome,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlinePlus,
} from 'react-icons/hi'
import { auth } from '../lib/firebase'

const user = () => auth.currentUser
const initial = () => {
  const u = user()
  return (u?.displayName?.[0] ?? u?.email?.[0] ?? 'U').toUpperCase()
}

const NAV = [
  { label: 'Overview', to: '/dashboard', end: true,  Icon: HiOutlineHome     },
  { label: 'Analytics', to: '/dashboard/analytics',  Icon: HiOutlineChartBar },
  { label: 'Patients',  to: '/dashboard/patients',   Icon: HiOutlineUsers    },
]

const navCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-50 text-blue-700'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`

export default function DashboardLayout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-100 shrink-0">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center shrink-0">
            <HiOutlinePlus className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-base">RagaHealth</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
            Menu
          </p>
          {NAV.map(({ label, to, end, Icon }) => (
            <NavLink key={to} to={to} end={end} className={navCls}>
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="border-t border-gray-100 p-4 shrink-0">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {initial()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user()?.displayName ?? 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user()?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <HiOutlineLogout className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shrink-0">
          <div className="flex-1" />
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <HiOutlineBell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {initial()}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
