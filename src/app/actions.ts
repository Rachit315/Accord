"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { Activity, DailyEntry, AppSettings, EntryStatus } from "@/lib/types";

type AccordData = {
  version: 1;
  activities: Activity[];
  entries: DailyEntry[];
  settings: AppSettings;
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  defaultFlexibility: 15,
  notifications: {
    dailyReminder: true,
    weeklyReport: true,
    streakAlerts: true,
    insightNotifications: true,
    reminderTime: "08:00",
  },
};

const MAX_HISTORY_DAYS = 90;

async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

async function requireAuthUserId(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId) {
    throw new Error("Unauthorized: User is not authenticated.");
  }
  return userId;
}

function normalizeSettings(settings: Partial<AppSettings> | undefined): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...(settings || {}),
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...(settings?.notifications || {}),
    },
  };
}

function normalizeStore(value: unknown): AccordData {
  const candidate = value as Partial<AccordData> | undefined;
  return {
    version: 1,
    activities: Array.isArray(candidate?.activities) ? candidate.activities : [],
    entries: Array.isArray(candidate?.entries) ? candidate.entries : [],
    settings: normalizeSettings(candidate?.settings),
  };
}

function pruneEntries(entries: DailyEntry[]) {
  const uniqueDates = Array.from(new Set(entries.map((entry) => entry.date))).sort();
  if (uniqueDates.length <= MAX_HISTORY_DAYS) {
    return entries;
  }

  const cutoff = uniqueDates[uniqueDates.length - MAX_HISTORY_DAYS];
  return entries.filter((entry) => entry.date >= cutoff);
}

async function readUserStore(clerkUserId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  const store = normalizeStore(user.privateMetadata?.accordData);
  const plan = (user.publicMetadata?.plan as "free" | "pro") || "free";
  return { client, user, store, plan };
}

async function writeUserStore(
  clerkUserId: string,
  store: AccordData,
  client?: Awaited<ReturnType<typeof clerkClient>>
) {
  const clerk = client || (await clerkClient());
  await clerk.users.updateUserMetadata(clerkUserId, {
    privateMetadata: {
      accordData: {
        ...store,
        entries: pruneEntries(store.entries),
      },
    },
  });
}

function ensureTodayEntries(store: AccordData, clerkUserId: string, todayDateStr: string) {
  const activeActivities = store.activities.filter((activity) => !activity.archived);
  const existing = new Set(
    store.entries
      .filter((entry) => entry.date === todayDateStr)
      .map((entry) => entry.activityId)
  );

  const missingEntries = activeActivities
    .filter((activity) => !existing.has(activity.id))
    .map<DailyEntry>((activity) => ({
      id: randomUUID(),
      activityId: activity.id,
      date: todayDateStr,
      idealTime: activity.idealTime,
      actualTime: null,
      status: "pending",
      deviation: 0,
      alignmentScore: 0,
    }));

  void clerkUserId;
  if (missingEntries.length > 0) {
    store.entries = [...store.entries, ...missingEntries];
  }

  return missingEntries.length > 0;
}

export async function fetchUserData(todayDateStr: string) {
  const clerkUserId = await getAuthUserId();
  if (!clerkUserId) {
    return null;
  }

  const { client, store } = await readUserStore(clerkUserId);
  const changed = ensureTodayEntries(store, clerkUserId, todayDateStr);
  if (changed) {
    await writeUserStore(clerkUserId, store, client);
  }

  const activities = [...store.activities].sort((a, b) => a.order - b.order);
  const allEntries = pruneEntries(store.entries).sort((a, b) => a.date.localeCompare(b.date));

  return {
    activities,
    settings: store.settings,
    todayEntries: allEntries.filter((entry) => entry.date === todayDateStr),
    allEntries,
  };
}

export async function createActivityAction(
  activityData: Omit<Activity, "id" | "order" | "createdAt" | "archived">,
  todayDateStr?: string
) {
  const clerkUserId = await requireAuthUserId();
  const { client, store, plan } = await readUserStore(clerkUserId);
  const activeCount = store.activities.filter((activity) => !activity.archived).length;

  if (plan === "free" && activeCount >= 5) {
    throw new Error("Free plan limit reached. Please upgrade to Pro.");
  }

  const newActivity: Activity = {
    ...activityData,
    id: randomUUID(),
    order: activeCount,
    archived: false,
    createdAt: new Date().toISOString(),
  };

  store.activities = [...store.activities, newActivity];

  if (todayDateStr) {
    const alreadyExists = store.entries.some(
      (entry) => entry.date === todayDateStr && entry.activityId === newActivity.id
    );
    if (!alreadyExists) {
      store.entries = [
        ...store.entries,
        {
          id: randomUUID(),
          activityId: newActivity.id,
          date: todayDateStr,
          idealTime: newActivity.idealTime,
          actualTime: null,
          status: "pending",
          deviation: 0,
          alignmentScore: 0,
        },
      ];
    }
  }

  await writeUserStore(clerkUserId, store, client);
  return newActivity;
}

export async function updateActivityAction(id: string, updates: Partial<Activity>) {
  const clerkUserId = await requireAuthUserId();
  const { client, store } = await readUserStore(clerkUserId);
  const existing = store.activities.find((activity) => activity.id === id);

  if (!existing) {
    throw new Error("Activity not found or access denied.");
  }

  const updated: Activity = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    order: updates.order ?? existing.order,
    archived: updates.archived ?? existing.archived,
  };

  store.activities = store.activities.map((activity) => (activity.id === id ? updated : activity));

  if (updates.idealTime && updates.idealTime !== existing.idealTime) {
    const todayStr = new Date().toISOString().split("T")[0];
    store.entries = store.entries.map((entry) =>
      entry.activityId === id && entry.date === todayStr && entry.status === "pending"
        ? { ...entry, idealTime: updates.idealTime! }
        : entry
    );
  }

  await writeUserStore(clerkUserId, store, client);
  return updated;
}

export async function deleteActivityAction(id: string) {
  const clerkUserId = await requireAuthUserId();
  const { client, store } = await readUserStore(clerkUserId);
  const exists = store.activities.some((activity) => activity.id === id);

  if (!exists) {
    throw new Error("Activity not found or access denied.");
  }

  store.activities = store.activities.filter((activity) => activity.id !== id);
  store.entries = store.entries.filter((entry) => entry.activityId !== id);
  await writeUserStore(clerkUserId, store, client);
  return { success: true };
}

export async function reorderActivitiesAction(reorderedActivities: Activity[]) {
  const clerkUserId = await requireAuthUserId();
  const { client, store } = await readUserStore(clerkUserId);
  const allowedIds = new Set(store.activities.map((activity) => activity.id));
  const orderById = new Map(
    reorderedActivities
      .filter((activity) => allowedIds.has(activity.id))
      .map((activity, index) => [activity.id, index])
  );

  store.activities = store.activities
    .map((activity) => ({
      ...activity,
      order: orderById.get(activity.id) ?? activity.order,
    }))
    .sort((a, b) => a.order - b.order);

  await writeUserStore(clerkUserId, store, client);
  return { success: true };
}

export async function saveDailyEntryAction(id: string, updates: Partial<DailyEntry>) {
  const clerkUserId = await requireAuthUserId();
  const { client, store } = await readUserStore(clerkUserId);
  const existing = store.entries.find((entry) => entry.id === id);

  if (!existing) {
    throw new Error("Daily entry not found or access denied.");
  }

  const updated: DailyEntry = {
    ...existing,
    actualTime: updates.actualTime === undefined ? existing.actualTime : updates.actualTime,
    status: (updates.status as EntryStatus | undefined) ?? existing.status,
    deviation: updates.deviation ?? existing.deviation,
    alignmentScore: updates.alignmentScore ?? existing.alignmentScore,
  };

  store.entries = store.entries.map((entry) => (entry.id === id ? updated : entry));
  await writeUserStore(clerkUserId, store, client);
  return updated;
}

export async function updateSettingsAction(updates: Partial<AppSettings>) {
  const clerkUserId = await requireAuthUserId();
  const { client, store } = await readUserStore(clerkUserId);

  store.settings = normalizeSettings({
    ...store.settings,
    ...updates,
    notifications: {
      ...store.settings.notifications,
      ...(updates.notifications || {}),
    },
  });

  await writeUserStore(clerkUserId, store, client);
  return { success: true };
}

export async function updateUserPlanAction(plan: "free" | "pro") {
  const clerkUserId = await requireAuthUserId();
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: {
      plan,
    },
  });
  return { success: true };
}

export async function verifyCheckoutAction(checkoutId: string) {
  const clerkUserId = await requireAuthUserId();

  try {
    if (!process.env.POLAR_ACCESS_TOKEN) {
      return { success: false, error: "Polar access token is not configured." };
    }

    const { polar } = await import("@/lib/polar");
    const checkout = await polar.checkouts.get({ id: checkoutId });

    if (checkout.status === "confirmed" || checkout.status === "succeeded") {
      const client = await clerkClient();
      await client.users.updateUserMetadata(clerkUserId, {
        publicMetadata: {
          plan: "pro",
          polarCustomerId: checkout.customerId,
          polarCheckoutId: checkout.id,
          upgradedAt: new Date().toISOString(),
        },
      });
      return { success: true };
    }

    return { success: false, status: checkout.status };
  } catch (error) {
    console.error("[checkout] verification failed", {
      checkoutId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
