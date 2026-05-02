const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export type Stats = {
  totalPatients: number
  todayAppointments: number
  activeCases: number
  criticalAlerts: number
}

export type Patient = {
  id: string
  name: string
  age: number
  condition: string
  status: 'Active' | 'Critical' | 'Stable'
  time: string
}

export const mockApi = {
  async getStats(): Promise<Stats> {
    await delay(900)
    return {
      totalPatients: 2847,
      todayAppointments: 24,
      activeCases: 158,
      criticalAlerts: 3,
    }
  },

  async getPatients(): Promise<Patient[]> {
    await delay(1100)
    return [
      { id: 'P-1042', name: 'Sarah Johnson',  age: 45, condition: 'Hypertension',    status: 'Active',   time: '9:00 AM'  },
      { id: 'P-1041', name: 'Michael Chen',   age: 62, condition: 'Diabetes Type 2', status: 'Critical', time: '10:30 AM' },
      { id: 'P-1040', name: 'Emily Davis',    age: 34, condition: 'Asthma',          status: 'Stable',   time: '11:00 AM' },
      { id: 'P-1039', name: 'Robert Wilson',  age: 58, condition: 'Cardiac Care',    status: 'Active',   time: '2:00 PM'  },
      { id: 'P-1038', name: 'Maria Garcia',   age: 29, condition: 'Prenatal Care',   status: 'Stable',   time: '3:30 PM'  },
    ]
  },
}
