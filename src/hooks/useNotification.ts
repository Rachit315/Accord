"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showSystemNotification,
} from "@/lib/notifications";

export function useNotification() {
  const [supported, setSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  // Sync state on mount
  useEffect(() => {
    const isSupported = isNotificationSupported();
    setSupported(isSupported);
    if (isSupported) {
      setPermission(getNotificationPermission());
    }
  }, []);

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
