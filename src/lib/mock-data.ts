import {
  Activity,
  DailyEntry,
  DayRecord,
  InsightCard,
  WeeklyReport,
  Achievement,
  UserProfile,
  PricingPlan,
  Testimonial,
  EntryStatus,
} from "./types";

// ── Activities ───────────────────────────────────────────────────────
export const defaultActivities: Activity[] = [];

// ── Seed-based random for deterministic data ─────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Generate 90 days of history ──────────────────────────────────────
function generateHistory(): DayRecord[] {
  return [];
}

export const historyData: DayRecord[] = generateHistory();

// ── Weekly alignment data for charts ─────────────────────────────────
export function getWeeklyAlignmentData() {
  const last7 = historyData.slice(-7);
  return last7.map((day) => ({
    day: new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }),
    date: day.date,
    alignment: day.overallAlignment,
  }));
}

export function getMonthlyAlignmentData() {
  const last30 = historyData.slice(-30);
  return last30.map((day) => ({
    day: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    date: day.date,
    alignment: day.overallAlignment,
  }));
}

// ── Activity performance ─────────────────────────────────────────────
export function getActivityPerformance() {
  return defaultActivities
    .filter((a) => !a.archived)
    .map((activity) => {
      const allEntries = historyData.flatMap((d) =>
        d.entries.filter((e) => e.activityId === activity.id && e.status !== "skipped")
      );
      const avgScore =
        allEntries.length > 0
          ? Math.round(allEntries.reduce((s, e) => s + e.alignmentScore, 0) / allEntries.length)
          : 0;
      return {
        name: activity.title,
        score: avgScore,
        color: activity.color,
        completionRate: Math.round(
          (allEntries.length / historyData.length) * 100
        ),
      };
    });
}

// ── Time deviation analysis ──────────────────────────────────────────
export function getDeviationAnalysis() {
  return defaultActivities
    .filter((a) => !a.archived)
    .map((activity) => {
      const allEntries = historyData.flatMap((d) =>
        d.entries.filter((e) => e.activityId === activity.id && e.status !== "skipped")
      );
      const avgDev =
        allEntries.length > 0
          ? Math.round(allEntries.reduce((s, e) => s + e.deviation, 0) / allEntries.length)
          : 0;
      return {
        name: activity.title,
        avgDeviation: avgDev,
        color: activity.color,
      };
    });
}

// ── Today's entries ──────────────────────────────────────────────────
export function getTodaysEntries(): DailyEntry[] {
  const today = historyData[historyData.length - 1];
  return today ? today.entries : [];
}

// ── Streaks ──────────────────────────────────────────────────────────
export function calculateStreak(): { current: number; longest: number } {
  let current = 0;
  let longest = 0;
  let tempStreak = 0;

  for (let i = historyData.length - 1; i >= 0; i--) {
    if (historyData[i].overallAlignment >= 60) {
      tempStreak++;
      if (i === historyData.length - 1 || current === tempStreak - 1) {
        current = tempStreak;
      }
    } else {
      longest = Math.max(longest, tempStreak);
      if (current < tempStreak) break;
      tempStreak = 0;
    }
  }
  longest = Math.max(longest, tempStreak);

  return { current: Math.min(current, 23), longest: Math.min(longest, 34) };
}

// ── Heatmap data ─────────────────────────────────────────────────────
export function getHeatmapData() {
  return historyData.map((day) => ({
    date: day.date,
    value: day.overallAlignment,
  }));
}

// ── Overall stats ────────────────────────────────────────────────────
export function getOverallStats() {
  const allEntries = historyData.flatMap((d) => d.entries);
  const completedEntries = allEntries.filter(
    (e) => e.status !== "skipped" && e.status !== "pending"
  );
  const avgAlignment =
    completedEntries.length > 0
      ? Math.round(
          completedEntries.reduce((s, e) => s + e.alignmentScore, 0) /
            completedEntries.length
        )
      : 0;
  const streak = calculateStreak();

  return {
    alignmentScore: avgAlignment,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    totalActivities: defaultActivities.filter((a) => !a.archived).length,
    totalEntries: completedEntries.length,
  };
}

// ── Activity detail data ─────────────────────────────────────────────
export function getActivityDetail(activityId: string) {
  const activity = defaultActivities.find((a) => a.id === activityId);
  if (!activity) return null;

  const allEntries = historyData.flatMap((d) =>
    d.entries.filter((e) => e.activityId === activityId)
  );
  const completed = allEntries.filter((e) => e.status !== "skipped");
  const avgScore =
    completed.length > 0
      ? Math.round(completed.reduce((s, e) => s + e.alignmentScore, 0) / completed.length)
      : 0;
  const avgDelay =
    completed.length > 0
      ? Math.round(completed.reduce((s, e) => s + Math.abs(e.deviation), 0) / completed.length)
      : 0;
  const completionRate = Math.round((completed.length / allEntries.length) * 100);

  const weeklyTrend = historyData.slice(-7).map((day) => {
    const entry = day.entries.find((e) => e.activityId === activityId);
    return {
      day: new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }),
      score: entry?.alignmentScore ?? 0,
      deviation: entry?.deviation ?? 0,
    };
  });

  const monthlyTrend = historyData.slice(-30).map((day) => {
    const entry = day.entries.find((e) => e.activityId === activityId);
    return {
      day: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: entry?.alignmentScore ?? 0,
    };
  });

  const history = historyData.slice(-30).map((day) => {
    const entry = day.entries.find((e) => e.activityId === activityId);
    return {
      date: day.date,
      status: entry?.status ?? "skipped",
      actualTime: entry?.actualTime,
      deviation: entry?.deviation ?? 0,
      alignmentScore: entry?.alignmentScore ?? 0,
    };
  });

  return {
    activity,
    performanceScore: avgScore,
    completionRate,
    averageDelay: avgDelay,
    weeklyTrend,
    monthlyTrend,
    history,
  };
}

// ── Insights ─────────────────────────────────────────────────────────
export const mockInsights: InsightCard[] = [];

// ── Weekly Report ────────────────────────────────────────────────────
export const mockWeeklyReport: WeeklyReport = {
  weekOf: new Date().toISOString().split("T")[0],
  bestActivity: { name: "None", score: 0 },
  worstActivity: { name: "None", score: 0 },
  averageDeviation: 0,
  consistencyScore: 0,
  totalEntries: 0,
  completedEntries: 0,
  skippedEntries: 0,
  comparedToPreviousWeek: 0,
};

// ── Achievements ─────────────────────────────────────────────────────
export const mockAchievements: Achievement[] = [
  {
    id: "ach-1",
    title: "First Steps",
    description: "Complete your first day with 80%+ alignment",
    icon: "Award",
    unlockedAt: null,
    requirement: 1,
    type: "alignment",
  },
  {
    id: "ach-2",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "Shield",
    unlockedAt: null,
    requirement: 7,
    type: "streak",
  },
  {
    id: "ach-3",
    title: "Fortnight Focus",
    description: "Maintain a 14-day streak",
    icon: "Zap",
    unlockedAt: null,
    requirement: 14,
    type: "streak",
  },
  {
    id: "ach-4",
    title: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "Crown",
    unlockedAt: null,
    requirement: 30,
    type: "streak",
  },
  {
    id: "ach-5",
    title: "Century Club",
    description: "Log 100 activities",
    icon: "Star",
    unlockedAt: null,
    requirement: 100,
    type: "completion",
  },
  {
    id: "ach-6",
    title: "Perfect Day",
    description: "Achieve 100% alignment for an entire day",
    icon: "Sparkles",
    unlockedAt: null,
    requirement: 100,
    type: "alignment",
  },
  {
    id: "ach-7",
    title: "Two Month Titan",
    description: "Maintain a 60-day streak",
    icon: "Mountain",
    unlockedAt: null,
    requirement: 60,
    type: "streak",
  },
  {
    id: "ach-8",
    title: "Habit Hero",
    description: "Complete 500 activities total",
    icon: "Medal",
    unlockedAt: null,
    requirement: 500,
    type: "completion",
  },
];

// ── User Profile ─────────────────────────────────────────────────────
export const mockUser: UserProfile = {
  id: "user-1",
  name: "Alex Morgan",
  email: "alex@accord.app",
  avatar: "",
  plan: "free",
  joinedAt: "2026-03-21",
  currentStreak: 23,
  longestStreak: 34,
};

// ── Pricing ──────────────────────────────────────────────────────────
export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "forever",
    description: "Perfect for getting started with routine tracking.",
    features: [
      "Up to 5 activities",
      "7-day history",
      "Basic alignment tracking",
      "Daily entry logging",
      "Weekly summary",
    ],
    highlighted: false,
    cta: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    price: 6,
    interval: "month",
    description: "For those serious about building better habits.",
    features: [
      "Unlimited activities",
      "90-day history",
      "Advanced analytics",
      "AI-powered insights",
      "Custom reminders",
      "Activity heatmap",
      "Weekly reports",
      "Data export",
      "Priority support",
    ],
    highlighted: true,
    cta: "Start Free Trial",
  },
];

// ── Testimonials ─────────────────────────────────────────────────────
export const testimonials: Testimonial[] = [
  {
    id: "t-1",
    name: "Sarah Chen",
    role: "Product Designer",
    avatar: "",
    quote: "Accord helped me realize I was spending 2 hours more on social media than I thought. Now my mornings are intentional and productive.",
    rating: 5,
  },
  {
    id: "t-2",
    name: "Marcus Williams",
    role: "Software Engineer",
    avatar: "",
    quote: "The alignment score is genius. It's like a fitness tracker for your daily routine. I've improved my consistency by 40% in just 3 weeks.",
    rating: 5,
  },
  {
    id: "t-3",
    name: "Priya Sharma",
    role: "Graduate Student",
    avatar: "",
    quote: "I used to set ambitious schedules and never follow them. Accord's flexibility windows changed everything — I finally feel in control.",
    rating: 5,
  },
  {
    id: "t-4",
    name: "James O'Brien",
    role: "Startup Founder",
    avatar: "",
    quote: "The insights feature is incredible. It told me my productivity drops every Thursday afternoon, and I adjusted my schedule accordingly.",
    rating: 5,
  },
];
