import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { mockApi, type Vitals } from '../../lib/mockApi'

type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

type VitalsState = {
  list: Vitals[]
  status: Status
  error: string | null
}

const initialState: VitalsState = { list: [], status: 'idle', error: null }

export const fetchVitals = createAsyncThunk('vitals/fetchAll', () => mockApi.getVitals())

const vitalsSlice = createSlice({
  name: 'vitals',
  initialState,
  reducers: {
    updateVital(state, action: { payload: Vitals }) {
      const idx = state.list.findIndex((v) => v.patientId === action.payload.patientId)
      if (idx !== -1) state.list[idx] = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVitals.pending, (state) => { state.status = 'loading' })
      .addCase(fetchVitals.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchVitals.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to fetch vitals'
      })
  },
})

export const { updateVital } = vitalsSlice.actions
export default vitalsSlice.reducer
