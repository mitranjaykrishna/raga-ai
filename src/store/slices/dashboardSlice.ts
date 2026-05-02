import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { mockApi, type Stats } from '../../lib/mockApi'

type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

type DashboardState = {
  stats: Stats | null
  status: Status
  error: string | null
}

const initialState: DashboardState = {
  stats: null,
  status: 'idle',
  error: null,
}

export const fetchStats = createAsyncThunk('dashboard/fetchStats', () =>
  mockApi.getStats()
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.stats = action.payload
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to fetch stats'
      })
  },
})

export default dashboardSlice.reducer
