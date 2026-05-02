self.addEventListener('install', (e) => e.waitUntil(self.skipWaiting()))
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// Page sends { type:'NOTIFY', title, body, tag, requireInteraction }
// SW shows it — this is the only path Chrome reliably allows
self.addEventListener('message', (e) => {
  if (e.data?.type !== 'NOTIFY') return
  const { title, body, tag = 'raga', requireInteraction = false } = e.data
  e.waitUntil(
    self.registration.showNotification(title, { body, tag, requireInteraction })
  )
})

self.addEventListener('push', (e) => {
  const data = e.data?.json() ?? {}
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'RagaHealth Alert', {
      body: data.body ?? '',
      tag: data.tag ?? 'raga',
      requireInteraction: data.requireInteraction ?? false,
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((list) => {
      const existing = list.find((c) => c.url.includes('/dashboard'))
      if (existing) return existing.focus()
      return self.clients.openWindow('/dashboard/vitals')
    })
  )
})
