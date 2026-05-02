import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from './slices/dashboardSlice'
import patientsReducer from './slices/patientsSlice'
import vitalsReducer from './slices/vitalsSlice'
import notificationsReducer from './slices/notificationsSlice'

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    patients: patientsReducer,
    vitals: vitalsReducer,
    notifications: notificationsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
