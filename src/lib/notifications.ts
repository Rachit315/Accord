/**
 * Utility functions for interacting with the Web Notifications API.
 */

/**
 * Checks if the browser supports the Web Notifications API.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Gets the current notification permission state.
 * Returns 'denied' if notifications are unsupported.
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return "denied";
  }
  return Notification.permission;
}

/**
 * Requests permission to show notifications.
 * Returns a promise that resolves to the granted permission state.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return "denied";
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "default";
  }
}

/**
 * Shows a browser system notification.
 * @param title The title of the notification
 * @param options Configuration options for the notification
 */
export function showSystemNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!isNotificationSupported() || getNotificationPermission() !== "granted") {
    return null;
  }

  try {
    const defaultOptions: NotificationOptions = {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    };
    
    // Create and return the notification
    return new Notification(title, defaultOptions);
  } catch (error) {
    console.error("Failed to display notification:", error);
    return null;
  }
}
