"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Activity, DailyEntry, AppSettings } from "@/lib/types";

// Helper to get the authenticated user's ID, or null if not signed in
async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

// Helper that throws if not authenticated (for mutation actions)
async function requireAuthUserId(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId) {
    throw new Error("Unauthorized: User is not authenticated.");
  }
  return userId;
}

/**
 * Fetches all database records for the authenticated user.
 * Generates pending entries for "today" if they do not exist.
 * @param todayDateStr Local date string in format YYYY-MM-DD
 */
export async function fetchUserData(todayDateStr: string) {
  const clerkUserId = await getAuthUserId();

  // If not authenticated, return null so the caller can skip state updates
  if (!clerkUserId) {
    return null;
  }

  // 1. Load or initialize UserSettings
  let settings = await db.userSettings.findUnique({
    where: { clerkUserId },
  });

  if (!settings) {
    settings = await db.userSettings.create({
      data: {
        clerkUserId,
        theme: "dark",
        defaultFlexibility: 15,
        dailyReminder: true,
        weeklyReport: true,
        streakAlerts: true,
        insightNotifications: true,
        reminderTime: "08:00",
      },
    });
  }

  // 2. Load all activities (active + archived)
  const activitiesDb = await db.activity.findMany({
    where: { clerkUserId },
    orderBy: { order: "asc" },
  });

  const activities: Activity[] = activitiesDb.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description || "",
    idealTime: a.idealTime,
    flexibilityWindow: a.flexibilityWindow,
    icon: a.icon,
    color: a.color,
    reminderEnabled: a.reminderEnabled,
    archived: a.archived,
    order: a.order,
    createdAt: a.createdAt.toISOString(),
  }));

  // 3. Generate today's pending entries for any active activities that don't have them
  const activeActivities = activities.filter((a) => !a.archived);
  
  if (activeActivities.length > 0) {
    const existingEntries = await db.dailyEntry.findMany({
      where: {
        clerkUserId,
        date: todayDateStr,
      },
    });
    
    const existingActivityIds = new Set(existingEntries.map((e) => e.activityId));
    const missingActivities = activeActivities.filter((a) => !existingActivityIds.has(a.id));

    if (missingActivities.length > 0) {
      const createPromises = missingActivities.map((a) =>
        db.dailyEntry.create({
          data: {
            clerkUserId,
            activityId: a.id,
            date: todayDateStr,
            idealTime: a.idealTime,
            actualTime: null,
            status: "pending",
            deviation: 0,
            alignmentScore: 0,
          },
        })
      );
      
      // Execute creations inside a transaction
      await db.$transaction(createPromises);
    }
  }

  // 4. Fetch all entries to build history
  const allEntriesDb = await db.dailyEntry.findMany({
    where: { clerkUserId },
    orderBy: { date: "asc" },
  });

  const allEntries: DailyEntry[] = allEntriesDb.map((e) => ({
    id: e.id,
    activityId: e.activityId,
    date: e.date,
    idealTime: e.idealTime,
    actualTime: e.actualTime,
    status: e.status as any,
    deviation: e.deviation,
    alignmentScore: e.alignmentScore,
  }));

  const todayEntries = allEntries.filter((e) => e.date === todayDateStr);

  const appSettings: AppSettings = {
    theme: settings.theme as any,
    defaultFlexibility: settings.defaultFlexibility,
    notifications: {
      dailyReminder: settings.dailyReminder,
      weeklyReport: settings.weeklyReport,
      streakAlerts: settings.streakAlerts,
      insightNotifications: settings.insightNotifications,
      reminderTime: settings.reminderTime,
    },
  };

  return {
    activities,
    settings: appSettings,
    todayEntries,
    allEntries,
  };
}

/**
 * Creates a new routine activity and generates today's pending entry if applicable.
 */
export async function createActivityAction(
  activityData: Omit<Activity, "id" | "order" | "createdAt" | "archived">,
  todayDateStr?: string
) {
  const clerkUserId = await requireAuthUserId();

  // Find current count for ordering
  const activeCount = await db.activity.count({
    where: { clerkUserId, archived: false },
  });

  const newActivity = await db.activity.create({
    data: {
      clerkUserId,
      title: activityData.title,
      description: activityData.description,
      idealTime: activityData.idealTime,
      flexibilityWindow: activityData.flexibilityWindow,
      icon: activityData.icon,
      color: activityData.color,
      reminderEnabled: activityData.reminderEnabled,
      order: activeCount,
    },
  });

  // If a local date string was passed, create today's pending entry immediately
  if (todayDateStr) {
    await db.dailyEntry.create({
      data: {
        clerkUserId,
        activityId: newActivity.id,
        date: todayDateStr,
        idealTime: newActivity.idealTime,
        status: "pending",
        deviation: 0,
        alignmentScore: 0,
      },
    });
  }

  return {
    ...newActivity,
    description: newActivity.description || "",
    createdAt: newActivity.createdAt.toISOString(),
  } as Activity;
}

/**
 * Updates an activity in the database.
 */
export async function updateActivityAction(id: string, updates: Partial<Activity>) {
  const clerkUserId = await requireAuthUserId();

  // Verify ownership
  const activity = await db.activity.findFirst({
    where: { id, clerkUserId },
  });
  if (!activity) {
    throw new Error("Activity not found or access denied.");
  }

  const updated = await db.activity.update({
    where: { id },
    data: {
      title: updates.title,
      description: updates.description,
      idealTime: updates.idealTime,
      flexibilityWindow: updates.flexibilityWindow,
      icon: updates.icon,
      color: updates.color,
      reminderEnabled: updates.reminderEnabled,
      archived: updates.archived,
      order: updates.order,
    },
  });

  // If the idealTime changed, update today's pending entry idealTime to match
  if (updates.idealTime && updates.idealTime !== activity.idealTime) {
    const todayStr = new Date().toISOString().split("T")[0];
    await db.dailyEntry.updateMany({
      where: {
        activityId: id,
        date: todayStr,
        status: "pending",
      },
      data: {
        idealTime: updates.idealTime,
      },
    });
  }

  return {
    ...updated,
    description: updated.description || "",
    createdAt: updated.createdAt.toISOString(),
  } as Activity;
}

/**
 * Deletes an activity and all its related daily entries (cascade delete).
 */
export async function deleteActivityAction(id: string) {
  const clerkUserId = await requireAuthUserId();

  // Verify ownership
  const activity = await db.activity.findFirst({
    where: { id, clerkUserId },
  });
  if (!activity) {
    throw new Error("Activity not found or access denied.");
  }

  await db.activity.delete({
    where: { id },
  });

  return { success: true };
}

/**
 * Reorders activities in the database.
 */
export async function reorderActivitiesAction(reorderedActivities: Activity[]) {
  const clerkUserId = await requireAuthUserId();

  const updates = reorderedActivities.map((a, i) =>
    db.activity.updateMany({
      where: { id: a.id, clerkUserId },
      data: { order: i },
    })
  );

  await db.$transaction(updates);
  return { success: true };
}

/**
 * Saves/updates a daily entry check-in status.
 */
export async function saveDailyEntryAction(id: string, updates: Partial<DailyEntry>) {
  const clerkUserId = await requireAuthUserId();

  // Verify ownership
  const entry = await db.dailyEntry.findFirst({
    where: { id, clerkUserId },
  });
  if (!entry) {
    throw new Error("Daily entry not found or access denied.");
  }

  const updated = await db.dailyEntry.update({
    where: { id },
    data: {
      actualTime: updates.actualTime,
      status: updates.status,
      deviation: updates.deviation,
      alignmentScore: updates.alignmentScore,
    },
  });

  return {
    id: updated.id,
    activityId: updated.activityId,
    date: updated.date,
    idealTime: updated.idealTime,
    actualTime: updated.actualTime,
    status: updated.status as any,
    deviation: updated.deviation,
    alignmentScore: updated.alignmentScore,
  } as DailyEntry;
}

/**
 * Updates application preferences / UserSettings.
 */
export async function updateSettingsAction(updates: Partial<AppSettings>) {
  const clerkUserId = await requireAuthUserId();

  const dataToUpdate: any = {};
  if (updates.theme) dataToUpdate.theme = updates.theme;
  if (updates.defaultFlexibility !== undefined) dataToUpdate.defaultFlexibility = updates.defaultFlexibility;

  if (updates.notifications) {
    const notifs = updates.notifications;
    if (notifs.dailyReminder !== undefined) dataToUpdate.dailyReminder = notifs.dailyReminder;
    if (notifs.weeklyReport !== undefined) dataToUpdate.weeklyReport = notifs.weeklyReport;
    if (notifs.streakAlerts !== undefined) dataToUpdate.streakAlerts = notifs.streakAlerts;
    if (notifs.insightNotifications !== undefined) dataToUpdate.insightNotifications = notifs.insightNotifications;
    if (notifs.reminderTime !== undefined) dataToUpdate.reminderTime = notifs.reminderTime;
  }

  await db.userSettings.update({
    where: { clerkUserId },
    data: dataToUpdate,
  });

  return { success: true };
}

/**
 * Updates the user's plan in Clerk public metadata.
 */
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
