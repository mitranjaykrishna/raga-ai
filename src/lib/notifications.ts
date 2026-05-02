export function swSupported() {
  return "serviceWorker" in navigator && "Notification" in window;
}

export async function registerSW(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    // non-critical
  }
}

export function getPermission(): NotificationPermission {
  if (!("Notification" in window)) return "denied";
  return Notification.permission;
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

export async function notify(
  title: string,
  body: string,
  tag = "raga",
  requireInteraction = false,
): Promise<void> {
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;

  const payload = { type: "NOTIFY", title, body, tag, requireInteraction };

  // Path 1 — SW is already controlling this page (most common after first load)
  // Chrome requires notifications to come from the SW context; postMessage achieves this
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(payload);
    return;
  }

  // Path 2 — SW registered but not yet controller (very first page load with claim() in progress)
  // postMessage directly to the active worker
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration("/");
      if (reg?.active) {
        reg.active.postMessage(payload);
        return;
      }
    } catch {
      // fall through
    }
  }

  // Path 3 — No SW (Safari < 16, Firefox without SW, or localhost w/o HTTPS)
  new Notification(title, { body, tag, requireInteraction });
}
