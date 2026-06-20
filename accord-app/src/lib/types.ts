export interface Activity {
  id: string;
  title: string;
  description: string;
  idealTime: string; // HH:MM format
  flexibilityWindow: number; // minutes
  icon: string;
  color: string;
  reminderEnabled: boolean;
  archived: boolean;
  order: number;
  createdAt: string;
}

export type EntryStatus = "pending" | "on-time" | "late" | "early" | "skipped";

export interface DailyEntry {
  id: string;
  activityId: string;
  date: string; // YYYY-MM-DD
  idealTime: string;
  actualTime: string | null;
  status: EntryStatus;
  deviation: number; // minutes
  alignmentScore: number;
}

export interface DayRecord {
  date: string;
  entries: DailyEntry[];
  overallAlignment: number;
}

export interface InsightCard {
  id: string;
  type: "strength" | "improvement" | "trend" | "achievement";
  icon: string;
  title: string;
  description: string;
  metric?: string;
  metricLabel?: string;
  color: string;
}

export interface WeeklyReport {
  weekOf: string;
  bestActivity: { name: string; score: number };
  worstActivity: { name: string; score: number };
  averageDeviation: number;
  consistencyScore: number;
  totalEntries: number;
  completedEntries: number;
  skippedEntries: number;
  comparedToPreviousWeek: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  requirement: number;
  type: "streak" | "completion" | "alignment";
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: "free" | "pro";
  joinedAt: string;
  currentStreak: number;
  longestStreak: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
}

export interface NotificationSettings {
  dailyReminder: boolean;
  weeklyReport: boolean;
  streakAlerts: boolean;
  insightNotifications: boolean;
  reminderTime: string;
}

export interface AppSettings {
  theme: "dark" | "light";
  defaultFlexibility: number;
  notifications: NotificationSettings;
}
