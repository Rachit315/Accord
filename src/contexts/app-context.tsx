"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from "react";
import {
  Activity,
  DailyEntry,
  UserProfile,
  AppSettings,
  EntryStatus,
} from "@/lib/types";
import { mockUser } from "@/lib/mock-data";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  fetchUserData,
  createActivityAction,
  updateActivityAction,
  deleteActivityAction,
  reorderActivitiesAction,
  saveDailyEntryAction,
  updateSettingsAction,
  updateUserPlanAction,
} from "@/app/actions";
import { computeStatsAndHistory } from "@/lib/stats";
import { getCookie, setCookie, deleteCookie } from "@/lib/cookies";

interface AppContextType {
  // Loading state
  isLoading: boolean;

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
  addActivity: (activity: Omit<Activity, "id" | "order" | "createdAt" | "archived">) => Promise<boolean>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<boolean>;
  deleteActivity: (id: string) => Promise<boolean>;
  archiveActivity: (id: string) => Promise<boolean>;
  reorderActivities: (reordered: Activity[]) => Promise<boolean>;

  // Daily Entries
  todayEntries: DailyEntry[];
  allEntries: DailyEntry[];
  markDone: (entryId: string) => Promise<boolean>;
  skipEntry: (entryId: string) => Promise<boolean>;

  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Upgrade
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  upgradeToPro: () => void;
  refreshUser: () => Promise<void>;

  // Stats
  stats: ReturnType<typeof computeStatsAndHistory>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to get local date string YYYY-MM-DD
function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [todayEntries, setTodayEntries] = useState<DailyEntry[]>([]);
  const [allEntries, setAllEntries] = useState<DailyEntry[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [profileUpdates, setProfileUpdates] = useState<Partial<UserProfile>>({});

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

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return getCookie("accord_onboarding_completed") === "true";
  });

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

  // Filter entries to last 7 days for free plan
  const filteredEntries = useMemo(() => {
    if (user.plan === "free") {
      const uniqueDates = Array.from(new Set(allEntries.map((e) => e.date))).sort();
      if (uniqueDates.length > 7) {
        const cutOffDate = uniqueDates[uniqueDates.length - 7];
        return allEntries.filter((e) => e.date >= cutOffDate);
      }
    }
    return allEntries;
  }, [allEntries, user.plan]);

  // Compute dynamic stats and history reactively
  const computedStats = useMemo(() => {
    return computeStatsAndHistory(activities, filteredEntries);
  }, [activities, filteredEntries]);

  // Load user data on signin status change
  const refreshData = useCallback(async () => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const todayStr = getLocalDateString();
      const data = await fetchUserData(todayStr);
      // If auth wasn't ready on the server, skip updating state to avoid wiping data
      if (!data) {
        return;
      }
      setActivities(data.activities);
      setTodayEntries(data.todayEntries);
      setAllEntries(data.allEntries);
      setSettings(data.settings);
    } catch (error) {
      console.error("Failed to load user data from database:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;

    const timeout = window.setTimeout(() => {
      void refreshData();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [isLoaded, refreshData]);

  const signIn = useCallback((email: string, password: string) => {
    void email;
    void password;
    // Handled by Clerk redirect
  }, []);

  const signUp = useCallback((name: string, email: string, password: string) => {
    void name;
    void email;
    void password;
    // Handled by Clerk redirect
  }, []);

  const signOut = useCallback(async () => {
    if (typeof window !== "undefined") {
      deleteCookie("accord_onboarding_completed");
    }
    setProfileUpdates({});
    setActivities([]);
    setTodayEntries([]);
    setAllEntries([]);
    await clerkSignOut({ redirectUrl: "/" });
  }, [clerkSignOut]);

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true);
    if (typeof window !== "undefined") {
      setCookie("accord_onboarding_completed", "true");
    }
  }, []);

  const resetOnboarding = useCallback(() => {
    setHasCompletedOnboarding(false);
    if (typeof window !== "undefined") {
      deleteCookie("accord_onboarding_completed");
    }
  }, []);

  const addActivity = useCallback(
    async (activity: Omit<Activity, "id" | "order" | "createdAt" | "archived">) => {
      if (user.plan === "free" && activities.filter((a) => !a.archived).length >= 5) {
        setShowUpgradeModal(true);
        return false;
      }
      setIsLoading(true);
      try {
        const todayStr = getLocalDateString();
        const created = await createActivityAction(activity, todayStr);
        setActivities((prev) => [...prev, created].sort((a, b) => a.order - b.order));
        setTodayEntries((prev) => [
          ...prev,
          {
            id: `pending-${created.id}-${todayStr}`,
            activityId: created.id,
            date: todayStr,
            idealTime: created.idealTime,
            actualTime: null,
            status: "pending",
            deviation: 0,
            alignmentScore: 0,
          },
        ]);
        await refreshData();
        return true;
      } catch (error) {
        console.error("Error adding activity to DB:", error);
        setIsLoading(false);
        return false;
      }
    },
    [activities, user.plan, refreshData]
  );

  const updateActivity = useCallback(async (id: string, updates: Partial<Activity>) => {
    const previousActivities = activities;
    setActivities((prev) => prev.map((activity) => (activity.id === id ? { ...activity, ...updates } : activity)));
    setIsLoading(true);
    try {
      const updated = await updateActivityAction(id, updates);
      setActivities((prev) => prev.map((activity) => (activity.id === id ? updated : activity)));
      void refreshData();
      return true;
    } catch (error) {
      console.error("Error updating activity in DB:", error);
      setActivities(previousActivities);
      setIsLoading(false);
      return false;
    }
  }, [activities, refreshData]);

  const deleteActivity = useCallback(async (id: string) => {
    const previousActivities = activities;
    const previousTodayEntries = todayEntries;
    const previousAllEntries = allEntries;
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
    setTodayEntries((prev) => prev.filter((entry) => entry.activityId !== id));
    setAllEntries((prev) => prev.filter((entry) => entry.activityId !== id));
    setIsLoading(true);
    try {
      await deleteActivityAction(id);
      void refreshData();
      return true;
    } catch (error) {
      console.error("Error deleting activity in DB:", error);
      setActivities(previousActivities);
      setTodayEntries(previousTodayEntries);
      setAllEntries(previousAllEntries);
      setIsLoading(false);
      return false;
    }
  }, [activities, todayEntries, allEntries, refreshData]);

  const archiveActivity = useCallback(async (id: string) => {
    const previousActivities = activities;
    setActivities((prev) => prev.map((activity) => (activity.id === id ? { ...activity, archived: true } : activity)));
    setIsLoading(true);
    try {
      await updateActivityAction(id, { archived: true });
      void refreshData();
      return true;
    } catch (error) {
      console.error("Error archiving activity in DB:", error);
      setActivities(previousActivities);
      setIsLoading(false);
      return false;
    }
  }, [activities, refreshData]);

  const reorderActivities = useCallback(async (reordered: Activity[]) => {
    // Optimistic reorder for snappy drag-drop feel
    setActivities(reordered.map((a, i) => ({ ...a, order: i })));
    try {
      await reorderActivitiesAction(reordered);
      // Silent refresh to verify backend consistency
      const todayStr = getLocalDateString();
      const data = await fetchUserData(todayStr);
      if (data) {
        setActivities(data.activities);
      }
      return true;
    } catch (error) {
      console.error("Error reordering activities in DB:", error);
      void refreshData();
      return false;
    }
  }, [refreshData]);

  const markDone = useCallback(async (entryId: string) => {
    const entry = todayEntries.find((e) => e.id === entryId);
    if (!entry) return false;

    const activity = activities.find((a) => a.id === entry.activityId);
    if (!activity) return false;

    const previousTodayEntries = todayEntries;
    const previousAllEntries = allEntries;
    try {
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

      const optimisticEntry = {
        ...entry,
        actualTime,
        status,
        deviation,
        alignmentScore,
      };
      setTodayEntries((prev) => prev.map((item) => (item.id === entryId ? optimisticEntry : item)));
      setAllEntries((prev) => prev.map((item) => (item.id === entryId ? optimisticEntry : item)));
      await saveDailyEntryAction(entryId, {
        actualTime,
        status,
        deviation,
        alignmentScore,
      });
      void refreshData();
      return true;
    } catch (error) {
      console.error("Error marking entry done in DB:", error);
      setTodayEntries(previousTodayEntries);
      setAllEntries(previousAllEntries);
      return false;
    }
  }, [activities, todayEntries, allEntries, refreshData]);

  const skipEntry = useCallback(async (entryId: string) => {
    const previousTodayEntries = todayEntries;
    const previousAllEntries = allEntries;
    try {
      const optimistic = (entry: DailyEntry) =>
        entry.id === entryId
          ? { ...entry, status: "skipped" as EntryStatus, actualTime: null, deviation: 0, alignmentScore: 0 }
          : entry;
      setTodayEntries((prev) => prev.map(optimistic));
      setAllEntries((prev) => prev.map(optimistic));
      await saveDailyEntryAction(entryId, {
        status: "skipped" as EntryStatus,
        actualTime: null,
        deviation: 0,
        alignmentScore: 0,
      });
      void refreshData();
      return true;
    } catch (error) {
      console.error("Error skipping entry in DB:", error);
      setTodayEntries(previousTodayEntries);
      setAllEntries(previousAllEntries);
      return false;
    }
  }, [todayEntries, allEntries, refreshData]);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    // Optimistic merge
    const mergedSettings = {
      ...settings,
      ...updates,
      notifications: {
        ...settings.notifications,
        ...(updates.notifications || {}),
      },
    };
    setSettings(mergedSettings);
    
    try {
      await updateSettingsAction(mergedSettings);
      return true;
    } catch (error) {
      console.error("Error updating settings in DB:", error);
      void refreshData();
      return false;
    }
  }, [settings, refreshData]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfileUpdates((prev) => ({ ...prev, ...updates }));
  }, []);

  // Force-refresh the Clerk user session and all app data.
  // This is critical after payment: Clerk caches user metadata client-side,
  // so without reload() the user still sees plan:"free" after page refresh.
  const refreshUser = useCallback(async () => {
    if (clerkUser) {
      await clerkUser.reload();
    }
    // Clear local profile overrides so we read fresh data from Clerk
    setProfileUpdates({});
    await refreshData();
  }, [clerkUser, refreshData]);

  const upgradeToPro = useCallback(async () => {
    setProfileUpdates((prev) => ({ ...prev, plan: "pro" }));
    setShowUpgradeModal(false);
    try {
      await updateUserPlanAction("pro");
      // Reload Clerk user to pick up the new plan metadata
      await refreshUser();
    } catch (error) {
      console.error("Error upgrading plan in Clerk:", error);
    }
  }, [refreshUser]);

  return (
    <AppContext.Provider
      value={{
        isLoading,
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
        allEntries: filteredEntries,
        markDone,
        skipEntry,
        settings,
        updateSettings,
        updateProfile,
        showUpgradeModal,
        setShowUpgradeModal,
        upgradeToPro,
        refreshUser,
        stats: computedStats,
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
