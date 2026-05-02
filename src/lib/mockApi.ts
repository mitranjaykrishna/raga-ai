const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export type Stats = {
  totalPatients: number
  todayAppointments: number
  activeCases: number
  criticalAlerts: number
}

export type MonthlyTrend = {
  month: string
  patients: number
  appointments: number
}

export type DailyAppointments = {
  day: string
  count: number
}

export type Vitals = {
  patientId: string
  heartRate: number
  systolic: number
  diastolic: number
  spO2: number
  temperature: number
  respiratoryRate: number
  recordedAt: string
}

export type Patient = {
  id: string
  name: string
  age: number
  gender: 'Male' | 'Female'
  condition: string
  status: 'Active' | 'Critical' | 'Stable'
  time: string
  doctor: string
  lastVisit: string
  nextAppointment: string
  bloodType: string
  phone: string
  email: string
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
      { id: 'P-1042', name: 'Sarah Johnson',   age: 45, gender: 'Female', condition: 'Hypertension',      status: 'Active',   time: '9:00 AM',  doctor: 'Dr. Alan Wright',  lastVisit: 'Apr 20, 2025', nextAppointment: 'May 10, 2025', bloodType: 'O+',  phone: '(555) 101-2030', email: 'sarah.j@email.com'    },
      { id: 'P-1041', name: 'Michael Chen',    age: 62, gender: 'Male',   condition: 'Diabetes Type 2',   status: 'Critical', time: '10:30 AM', doctor: 'Dr. Priya Nair',   lastVisit: 'Apr 28, 2025', nextAppointment: 'May 05, 2025', bloodType: 'A+',  phone: '(555) 202-3141', email: 'mchen@email.com'       },
      { id: 'P-1040', name: 'Emily Davis',     age: 34, gender: 'Female', condition: 'Asthma',            status: 'Stable',   time: '11:00 AM', doctor: 'Dr. James Hooper', lastVisit: 'Mar 15, 2025', nextAppointment: 'Jun 15, 2025', bloodType: 'B+',  phone: '(555) 303-4252', email: 'emily.d@email.com'     },
      { id: 'P-1039', name: 'Robert Wilson',   age: 58, gender: 'Male',   condition: 'Cardiac Care',      status: 'Active',   time: '2:00 PM',  doctor: 'Dr. Alan Wright',  lastVisit: 'Apr 25, 2025', nextAppointment: 'May 15, 2025', bloodType: 'AB-', phone: '(555) 404-5363', email: 'r.wilson@email.com'    },
      { id: 'P-1038', name: 'Maria Garcia',    age: 29, gender: 'Female', condition: 'Prenatal Care',     status: 'Stable',   time: '3:30 PM',  doctor: 'Dr. Susan Lee',    lastVisit: 'Apr 22, 2025', nextAppointment: 'May 08, 2025', bloodType: 'O-',  phone: '(555) 505-6474', email: 'mgarcia@email.com'     },
      { id: 'P-1037', name: 'James Thompson',  age: 71, gender: 'Male',   condition: 'Arthritis',         status: 'Stable',   time: '4:00 PM',  doctor: 'Dr. Priya Nair',   lastVisit: 'Apr 10, 2025', nextAppointment: 'May 20, 2025', bloodType: 'A-',  phone: '(555) 606-7585', email: 'jthompson@email.com'   },
      { id: 'P-1036', name: 'Linda Martinez',  age: 52, gender: 'Female', condition: 'Chronic Migraine',  status: 'Active',   time: '9:30 AM',  doctor: 'Dr. James Hooper', lastVisit: 'Apr 18, 2025', nextAppointment: 'May 12, 2025', bloodType: 'B-',  phone: '(555) 707-8696', email: 'l.martinez@email.com'  },
      { id: 'P-1035', name: 'David Kim',       age: 40, gender: 'Male',   condition: 'Kidney Disease',    status: 'Critical', time: '11:30 AM', doctor: 'Dr. Susan Lee',    lastVisit: 'Apr 29, 2025', nextAppointment: 'May 06, 2025', bloodType: 'O+',  phone: '(555) 808-9707', email: 'dkim@email.com'        },
      { id: 'P-1034', name: 'Patricia Moore',  age: 66, gender: 'Female', condition: 'Hypertension',      status: 'Active',   time: '1:00 PM',  doctor: 'Dr. Alan Wright',  lastVisit: 'Apr 14, 2025', nextAppointment: 'May 28, 2025', bloodType: 'AB+', phone: '(555) 909-0818', email: 'pmoore@email.com'      },
      { id: 'P-1033', name: 'William Turner',  age: 48, gender: 'Male',   condition: 'Depression',        status: 'Stable',   time: '2:30 PM',  doctor: 'Dr. Priya Nair',   lastVisit: 'Apr 05, 2025', nextAppointment: 'May 19, 2025', bloodType: 'A+',  phone: '(555) 010-1929', email: 'wturner@email.com'     },
      { id: 'P-1032', name: 'Jennifer Adams',  age: 37, gender: 'Female', condition: 'Thyroid Disorder',  status: 'Stable',   time: '4:30 PM',  doctor: 'Dr. Susan Lee',    lastVisit: 'Mar 28, 2025', nextAppointment: 'Jun 01, 2025', bloodType: 'O+',  phone: '(555) 111-2030', email: 'jadams@email.com'      },
      { id: 'P-1031', name: 'Charles Brown',   age: 55, gender: 'Male',   condition: 'COPD',              status: 'Critical', time: '10:00 AM', doctor: 'Dr. James Hooper', lastVisit: 'Apr 30, 2025', nextAppointment: 'May 03, 2025', bloodType: 'B+',  phone: '(555) 212-3141', email: 'cbrown@email.com'      },
    ]
  },

  async getMonthlyTrend(): Promise<MonthlyTrend[]> {
    await delay(800)
    return [
      { month: 'Nov', patients: 198, appointments: 142 },
      { month: 'Dec', patients: 212, appointments: 158 },
      { month: 'Jan', patients: 245, appointments: 189 },
      { month: 'Feb', patients: 228, appointments: 172 },
      { month: 'Mar', patients: 267, appointments: 211 },
      { month: 'Apr', patients: 289, appointments: 224 },
      { month: 'May', patients: 312, appointments: 247 },
    ]
  },

  async getAppointmentsByDay(): Promise<DailyAppointments[]> {
    await delay(600)
    return [
      { day: 'Mon', count: 18 },
      { day: 'Tue', count: 24 },
      { day: 'Wed', count: 21 },
      { day: 'Thu', count: 27 },
      { day: 'Fri', count: 22 },
      { day: 'Sat', count: 9  },
      { day: 'Sun', count: 4  },
    ]
  },

  async getVitals(): Promise<Vitals[]> {
    await delay(750)
    return [
      { patientId: 'P-1042', heartRate: 88,  systolic: 145, diastolic: 92,  spO2: 97, temperature: 98.6, respiratoryRate: 16, recordedAt: '5 min ago'  },
      { patientId: 'P-1041', heartRate: 114, systolic: 168, diastolic: 102, spO2: 91, temperature: 100.2, respiratoryRate: 24, recordedAt: '2 min ago'  },
      { patientId: 'P-1040', heartRate: 76,  systolic: 116, diastolic: 74,  spO2: 93, temperature: 98.4, respiratoryRate: 26, recordedAt: '8 min ago'  },
      { patientId: 'P-1039', heartRate: 56,  systolic: 138, diastolic: 86,  spO2: 96, temperature: 98.1, respiratoryRate: 14, recordedAt: '3 min ago'  },
      { patientId: 'P-1038', heartRate: 82,  systolic: 112, diastolic: 70,  spO2: 99, temperature: 98.8, respiratoryRate: 17, recordedAt: '10 min ago' },
      { patientId: 'P-1037', heartRate: 68,  systolic: 124, diastolic: 78,  spO2: 98, temperature: 97.8, respiratoryRate: 15, recordedAt: '6 min ago'  },
      { patientId: 'P-1036', heartRate: 94,  systolic: 136, diastolic: 88,  spO2: 97, temperature: 99.4, respiratoryRate: 19, recordedAt: '4 min ago'  },
      { patientId: 'P-1035', heartRate: 106, systolic: 154, diastolic: 96,  spO2: 94, temperature: 99.8, respiratoryRate: 22, recordedAt: '1 min ago'  },
      { patientId: 'P-1034', heartRate: 74,  systolic: 144, diastolic: 90,  spO2: 97, temperature: 98.3, respiratoryRate: 16, recordedAt: '7 min ago'  },
      { patientId: 'P-1033', heartRate: 66,  systolic: 118, diastolic: 76,  spO2: 99, temperature: 98.0, respiratoryRate: 14, recordedAt: '9 min ago'  },
      { patientId: 'P-1032', heartRate: 78,  systolic: 110, diastolic: 68,  spO2: 98, temperature: 97.9, respiratoryRate: 15, recordedAt: '11 min ago' },
      { patientId: 'P-1031', heartRate: 122, systolic: 162, diastolic: 100, spO2: 88, temperature: 101.6, respiratoryRate: 28, recordedAt: '30 sec ago' },
    ]
  },
}
