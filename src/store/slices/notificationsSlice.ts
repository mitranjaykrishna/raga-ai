import { createSlice, nanoid } from '@reduxjs/toolkit'

export type AppNotification = {
  id: string
  title: string
  body: string
  critical: boolean
  timestamp: number
  read: boolean
}

type State = { list: AppNotification[] }

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { list: [] } as State,
  reducers: {
    addNotification: {
      reducer(state, action: { payload: AppNotification }) {
        state.list.unshift(action.payload)
        if (state.list.length > 50) state.list.length = 50
      },
      prepare(n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
        return { payload: { ...n, id: nanoid(), timestamp: Date.now(), read: false } }
      },
    },
    markAllRead(state) {
      state.list.forEach((n) => { n.read = true })
    },
    clearAll(state) {
      state.list = []
    },
  },
})

export const { addNotification, markAllRead, clearAll } = notificationsSlice.actions
export default notificationsSlice.reducer
