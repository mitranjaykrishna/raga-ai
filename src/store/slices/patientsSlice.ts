import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { mockApi, type Patient } from '../../lib/mockApi'

type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

type PatientsState = {
  list: Patient[]
  status: Status
  error: string | null
}

const initialState: PatientsState = {
  list: [],
  status: 'idle',
  error: null,
}

export const fetchPatients = createAsyncThunk('patients/fetchAll', () =>
  mockApi.getPatients()
)

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to fetch patients'
      })
  },
})

export default patientsSlice.reducer
