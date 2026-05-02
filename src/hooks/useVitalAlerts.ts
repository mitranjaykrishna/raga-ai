import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchVitals, updateVital } from '../store/slices/vitalsSlice'
import { fetchPatients } from '../store/slices/patientsSlice'
import { addNotification } from '../store/slices/notificationsSlice'
import { getPermission, notify } from '../lib/notifications'
import type { Vitals } from '../lib/mockApi'


const SCENARIO: {
  delay: number
  title: string
  body: string
  tag: string
  critical: boolean
  patch: Partial<Vitals> & { patientId: string }
}[] = [
  {
    delay: 8000,
    title: '🚨 COPD Crisis — Charles Brown',
    body: 'SpO₂ fell to 84% · HR 130 bpm · Oxygen therapy required immediately.',
    tag: 'copd-1', critical: true,
    patch: { patientId: 'P-1031', heartRate: 130, spO2: 84, respiratoryRate: 30, recordedAt: 'just now' },
  },
  {
    delay: 18000,
    title: '🚨 Hypertensive Crisis — Michael Chen',
    body: 'BP 182/112 mmHg · Temperature 101.0°F · Risk of end-organ damage.',
    tag: 'htn-1', critical: true,
    patch: { patientId: 'P-1041', systolic: 182, diastolic: 112, temperature: 101.0, recordedAt: 'just now' },
  },
  {
    delay: 28000,
    title: '🚨 Asthma Exacerbation — Emily Davis',
    body: 'RR 32/min · SpO₂ 88% · Bronchodilator and nebulisation initiated.',
    tag: 'asthma-1', critical: true,
    patch: { patientId: 'P-1040', respiratoryRate: 32, spO2: 88, heartRate: 108, recordedAt: 'just now' },
  },
  {
    delay: 38000,
    title: '🚨 Bradycardia — Robert Wilson',
    body: 'HR dropped to 44 bpm · Cardiac monitoring escalated · Cardiologist alerted.',
    tag: 'brady-1', critical: true,
    patch: { patientId: 'P-1039', heartRate: 44, recordedAt: 'just now' },
  },
  {
    delay: 48000,
    title: '⚠️ Sepsis Indicator — David Kim',
    body: 'Temp 102.6°F · HR 116 bpm · BP falling · Blood cultures ordered.',
    tag: 'sepsis-1', critical: false,
    patch: { patientId: 'P-1035', temperature: 102.6, heartRate: 116, systolic: 98, recordedAt: 'just now' },
  },
  {
    delay: 58000,
    title: '✅ Improving — Charles Brown',
    body: 'SpO₂ recovered to 93% · HR settling at 96 bpm · O₂ therapy effective.',
    tag: 'copd-2', critical: false,
    patch: { patientId: 'P-1031', heartRate: 96, spO2: 93, respiratoryRate: 22, recordedAt: 'just now' },
  },
  {
    delay: 68000,
    title: '✅ Stabilising — Emily Davis',
    body: 'RR normalising at 20/min · SpO₂ back to 95% · Nebulisation completed.',
    tag: 'asthma-2', critical: false,
    patch: { patientId: 'P-1040', respiratoryRate: 20, spO2: 95, heartRate: 84, recordedAt: 'just now' },
  },
  {
    delay: 78000,
    title: '✅ Sinus Rhythm Restored — Robert Wilson',
    body: 'HR 62 bpm · Pacemaker threshold reviewed · Cardiologist reviewing ECG.',
    tag: 'brady-2', critical: false,
    patch: { patientId: 'P-1039', heartRate: 62, recordedAt: 'just now' },
  },
]

export function useVitalAlerts() {
  const dispatch = useAppDispatch()
  const vitalsStatus   = useAppSelector((s) => s.vitals.status)
  const patientsStatus = useAppSelector((s) => s.patients.status)

  /* Ensure data is loaded */
  useEffect(() => {
    if (vitalsStatus === 'idle')   dispatch(fetchVitals())
    if (patientsStatus === 'idle') dispatch(fetchPatients())
  }, [vitalsStatus, patientsStatus, dispatch])

  /* Start the alert scenario.
   * Polls permission every 2 s so the scenario arms automatically when
   * the user grants permission — even if they do it after the page loaded. */
  useEffect(() => {
    if (vitalsStatus !== 'succeeded') return

    let timers: ReturnType<typeof setTimeout>[] = []
    let cycle: ReturnType<typeof setInterval> | null = null

    const fire = () => {
      timers.forEach(clearTimeout)
      timers = SCENARIO.map(({ delay, title, body, tag, critical, patch }) =>
        setTimeout(() => {
          notify(title, body, tag, critical)
          dispatch(addNotification({ title, body, critical }))
          dispatch((_, getState) => {
            const list = (getState() as { vitals: { list: Vitals[] } }).vitals.list
            const existing = list.find((v) => v.patientId === patch.patientId)
            if (existing) dispatch(updateVital({ ...existing, ...patch }))
          })
        }, delay)
      )
    }

    const start = () => {
      fire()
      cycle = setInterval(fire, 90000)
    }

    // If permission already granted, start immediately
    if (getPermission() === 'granted') {
      start()
      return () => {
        timers.forEach(clearTimeout)
        if (cycle) clearInterval(cycle)
      }
    }

    // Otherwise poll every 2 s until the user grants permission
    const poll = setInterval(() => {
      if (getPermission() === 'granted') {
        clearInterval(poll)
        start()
      }
    }, 2000)

    return () => {
      clearInterval(poll)
      timers.forEach(clearTimeout)
      if (cycle) clearInterval(cycle)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vitalsStatus])
}
