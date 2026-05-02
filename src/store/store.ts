import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from './slices/dashboardSlice'
import patientsReducer from './slices/patientsSlice'

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    patients: patientsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
