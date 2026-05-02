import { useEffect } from 'react'
import {
  HiX,
  HiPhone,
  HiMail,
  HiOutlineIdentification,
  HiOutlineClipboardList,
  HiOutlineUserCircle,
  HiOutlineClock,
} from 'react-icons/hi'
import type { Patient } from '../lib/mockApi'

const statusStyles: Record<Patient['status'], string> = {
  Active:   'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  Critical: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  Stable:   'bg-green-50 text-green-700 ring-1 ring-green-200',
}

const statusDot: Record<Patient['status'], string> = {
  Active:   'bg-blue-500',
  Critical: 'bg-red-500',
  Stable:   'bg-emerald-500',
}

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

function avatarColor(name: string) {
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-amber-500',  'bg-pink-500',  'bg-cyan-500',
    'bg-rose-500',   'bg-indigo-500','bg-teal-500',
  ]
  return colors[name.charCodeAt(0) % colors.length]
}

function InfoCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3.5 py-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${accent ? 'text-blue-600' : 'text-gray-800'}`}>{value}</p>
    </div>
  )
}

function Divider() {
  return <div className="border-t border-gray-100" />
}

export default function PatientDialog({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b border-gray-100">
          <div className={`w-14 h-14 rounded-2xl ${avatarColor(patient.name)} flex items-center justify-center text-white text-lg font-bold shrink-0`}>
            {initials(patient.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900">{patient.name}</h2>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[patient.status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot[patient.status]}`} />
                {patient.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {patient.id} · {patient.age} yrs · {patient.gender}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Clinical */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <HiOutlineClipboardList className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Clinical</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoCell label="Condition" value={patient.condition} />
              <InfoCell label="Blood Type" value={patient.bloodType} accent />
              <InfoCell label="Appointment Time" value={patient.time} />
              <InfoCell label="Status" value={patient.status} />
            </div>
          </section>

          <Divider />

          {/* Care team */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <HiOutlineUserCircle className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Care Team</h3>
            </div>
            <InfoCell label="Attending Doctor" value={patient.doctor} />
          </section>

          <Divider />

          {/* Visit schedule */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <HiOutlineClock className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Visit Schedule</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoCell label="Last Visit" value={patient.lastVisit} />
              <InfoCell label="Next Appointment" value={patient.nextAppointment} />
            </div>
          </section>

          <Divider />

          {/* Contact */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <HiOutlineIdentification className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <a
                href={`tel:${patient.phone}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
              >
                <HiPhone className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-800">{patient.phone}</p>
                </div>
              </a>
              <a
                href={`mailto:${patient.email}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
              >
                <HiMail className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-800">{patient.email}</p>
                </div>
              </a>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between rounded-b-2xl">
          <p className="text-xs text-gray-400">
            Patient ID: <span className="font-mono font-medium text-gray-600">{patient.id}</span>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
