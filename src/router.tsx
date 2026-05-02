import { createBrowserRouter } from 'react-router'
import RootLayout from './layouts/RootLayout'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'

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
        Component: DashboardLayout,
        children: [],
      },
    ],
  },
])
