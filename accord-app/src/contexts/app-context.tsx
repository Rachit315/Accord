"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";
import {
  Activity,
  DailyEntry,
  UserProfile,
  AppSettings,
  EntryStatus,
} from "@/lib/types";
import {
  defaultActivities,
  historyData,
  mockUser,
} from "@/lib/mock-data";
import { useUser, useClerk } from "@clerk/nextjs";

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  user: UserProfile;
  signIn: (email: string, password: string) => void;
  signUp: (name: string, email: string, password: string) => void;
  signOut: () => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // Activities
  activities: Activity[];
  addActivity: (activity: Omit<Activity, "id" | "order" | "createdAt" | "archived">) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  archiveActivity: (id: string) => void;
  reorderActivities: (reordered: Activity[]) => void;

  // Daily Entries
  todayEntries: DailyEntry[];
  markDone: (entryId: string) => void;
  skipEntry: (entryId: string) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Upgrade
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  upgradeToPro: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accord_onboarding_completed") === "true";
    }
    return false;
  });

  const [profileUpdates, setProfileUpdates] = useState<Partial<UserProfile>>({});

  const user = useMemo<UserProfile>(() => {
    if (isSignedIn && clerkUser) {
      return {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.username || "User",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        avatar: clerkUser.imageUrl,
        plan: (clerkUser.publicMetadata?.plan as "free" | "pro") || "free",
        joinedAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
        currentStreak: (clerkUser.publicMetadata?.currentStreak as number) ?? 5,
        longestStreak: (clerkUser.publicMetadata?.longestStreak as number) ?? 12,
        ...profileUpdates,
      };
    }
    return {
      ...mockUser,
      ...profileUpdates,
    };
  }, [isSignedIn, clerkUser, profileUpdates]);

  const isAuthenticated = !!isSignedIn;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [todayEntries, setTodayEntries] = useState<DailyEntry[]>([]);

  const [settings, setSettings] = useState<AppSettings>({
    theme: "dark",
    defaultFlexibility: 15,
    notifications: {
      dailyReminder: true,
      weeklyReport: true,
      streakAlerts: true,
      insightNotifications: true,
      reminderTime: "08:00",
    },
  });

  const signIn = useCallback((_email: string, _password: string) => {
    // Handled by Clerk redirect
  }, []);

  const signUp = useCallback((_name: string, _email: string, _password: string) => {
    // Handled by Clerk redirect
  }, []);

  const signOut = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accord_onboarding_completed");
    }
    setProfileUpdates({});
    await clerkSignOut();
  }, [clerkSignOut]);

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("accord_onboarding_completed", "true");
    }
  }, []);

  const resetOnboarding = useCallback(() => {
    setHasCompletedOnboarding(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("accord_onboarding_completed");
    }
  }, []);

  const addActivity = useCallback(
    (activity: Omit<Activity, "id" | "order" | "createdAt" | "archived">) => {
      if (user.plan === "free" && activities.filter((a) => !a.archived).length >= 5) {
        setShowUpgradeModal(true);
        return;
      }
      const newActivity: Activity = {
        ...activity,
        id: `act-${Date.now()}`,
        order: activities.length,
        createdAt: new Date().toISOString().split("T")[0],
        archived: false,
      };
      setActivities((prev) => [...prev, newActivity]);
      // Add a pending entry for today
      setTodayEntries((prev) => [
        ...prev,
        {
          id: `entry-today-${newActivity.id}`,
          activityId: newActivity.id,
          date: new Date().toISOString().split("T")[0],
          idealTime: newActivity.idealTime,
          actualTime: null,
          status: "pending",
          deviation: 0,
          alignmentScore: 0,
        },
      ]);
    },
    [activities, user.plan]
  );

  const updateActivity = useCallback((id: string, updates: Partial<Activity>) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const deleteActivity = useCallback((id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setTodayEntries((prev) => prev.filter((e) => e.activityId !== id));
  }, []);

  const archiveActivity = useCallback((id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, archived: true } : a))
    );
  }, []);

  const reorderActivities = useCallback((reordered: Activity[]) => {
    setActivities(reordered.map((a, i) => ({ ...a, order: i })));
  }, []);

  const markDone = useCallback((entryId: string) => {
    setTodayEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;
        const activity = activities.find((a) => a.id === entry.activityId);
        if (!activity) return entry;

        // Simulate actual time with realistic variance
        const [ih, im] = entry.idealTime.split(":").map(Number);
        const idealMinutes = ih * 60 + im;
        const variance = Math.round((Math.random() - 0.3) * 30);
        const actualMinutes = idealMinutes + variance;
        const ah = Math.floor(actualMinutes / 60) % 24;
        const am = Math.abs(actualMinutes % 60);
        const actualTime = `${ah.toString().padStart(2, "0")}:${am.toString().padStart(2, "0")}`;
        const deviation = variance;
        const absDeviation = Math.abs(deviation);

        let status: EntryStatus;
        if (absDeviation <= activity.flexibilityWindow) {
          status = "on-time";
        } else {
          status = deviation > 0 ? "late" : "early";
        }
        if (absDeviation <= 5) status = "on-time";

        const alignmentScore =
          absDeviation <= activity.flexibilityWindow
            ? 100
            : Math.max(0, Math.round(100 - (absDeviation - activity.flexibilityWindow) * 2));

        return {
          ...entry,
          actualTime,
          status,
          deviation,
          alignmentScore,
        };
      })
    );
  }, [activities]);

  const skipEntry = useCallback((entryId: string) => {
    setTodayEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? { ...entry, status: "skipped" as EntryStatus, actualTime: null, deviation: 0, alignmentScore: 0 }
          : entry
      )
    );
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfileUpdates((prev) => ({ ...prev, ...updates }));
  }, []);

  const upgradeToPro = useCallback(() => {
    setProfileUpdates((prev) => ({ ...prev, plan: "pro" }));
    setShowUpgradeModal(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        signIn,
        signUp,
        signOut,
        hasCompletedOnboarding,
        completeOnboarding,
        resetOnboarding,
        activities,
        addActivity,
        updateActivity,
        deleteActivity,
        archiveActivity,
        reorderActivities,
        todayEntries,
        markDone,
        skipEntry,
        settings,
        updateSettings,
        updateProfile,
        showUpgradeModal,
        setShowUpgradeModal,
        upgradeToPro,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
