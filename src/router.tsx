import { createBrowserRouter } from 'react-router'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Login from './pages/Login'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Login,
      },
    ],
  },
])
