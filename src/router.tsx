import { createBrowserRouter } from 'react-router'
import RootLayout from './layouts/RootLayout'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import DashboardHome from './pages/dashboard/Home'
import Analytics from './pages/dashboard/Analytics'
import Patients from './pages/dashboard/Patients'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        Component: AuthLayout,
        children: [
          { index: true, Component: Login },
          { path: 'login', Component: Login },
          { path: 'signup', Component: Signup },
        ],
      },
      {
        path: 'dashboard',
        Component: ProtectedRoute,
        children: [
          {
            Component: DashboardLayout,
            children: [
              { index: true, Component: DashboardHome },
              { path: 'analytics', Component: Analytics },
              { path: 'patients', Component: Patients },
            ],
          },
        ],
      },
    ],
  },
])
