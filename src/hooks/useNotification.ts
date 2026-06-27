"use client";

import { useState, useCallback } from "react";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showSystemNotification,
} from "@/lib/notifications";

export function useNotification() {
  const [supported] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return isNotificationSupported();
  });
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window === "undefined" || !isNotificationSupported()) {
      return "default";
    }
    return getNotificationPermission();
  });

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isNotificationSupported()) {
      return "denied";
    }

    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  }, []);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!supported || permission !== "granted") {
        console.warn("Notifications are not allowed or not supported.");
        return null;
      }
      return showSystemNotification(title, options);
    },
    [supported, permission]
  );

  return {
    isSupported: supported,
    permission,
    requestPermission,
    sendNotification,
  };
}
