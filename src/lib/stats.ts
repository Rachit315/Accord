import {
  Activity,
  DailyEntry,
  DayRecord,
  WeeklyReport,
  Achievement,
  InsightCard,
} from "./types";

/**
 * Recalculates all dashboard statistics, history records, and charts
 * dynamically from persisted database records.
 */
export function computeStatsAndHistory(
  activities: Activity[],
  allEntries: DailyEntry[]
) {
  // 1. Group entries by date
  const entriesByDate: Record<string, DailyEntry[]> = {};
  allEntries.forEach((entry) => {
    if (!entriesByDate[entry.date]) {
      entriesByDate[entry.date] = [];
    }
    entriesByDate[entry.date].push(entry);
  });

  // 2. Build historyData: DayRecord[]
  const dates = Object.keys(entriesByDate).sort();
  const historyData: DayRecord[] = dates.map((dateStr) => {
    const dayEntries = entriesByDate[dateStr];
    const completed = dayEntries.filter(
      (e) => e.status !== "skipped" && e.status !== "pending"
    );
    const overallAlignment =
      completed.length > 0
        ? Math.round(
            completed.reduce((sum, e) => sum + e.alignmentScore, 0) /
              completed.length
          )
        : 0;

    return {
      date: dateStr,
      entries: dayEntries,
      overallAlignment,
    };
  });

  // 3. Compute Streak
  const streak = calculateStreakFromHistory(historyData);

  // 4. Compute overall stats
  const completedEntries = allEntries.filter(
    (e) => e.status !== "skipped" && e.status !== "pending"
  );
  const avgAlignment =
    completedEntries.length > 0
      ? Math.round(
          completedEntries.reduce((sum, e) => sum + e.alignmentScore, 0) /
            completedEntries.length
        )
      : 0;

  const overallStats = {
    alignmentScore: avgAlignment,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    totalActivities: activities.filter((a) => !a.archived).length,
    totalEntries: completedEntries.length,
  };

  // 5. Chart Data: Last 7 days
  const last7Days = historyData.slice(-7);
  const weeklyAlignmentData = last7Days.map((day) => ({
    day: new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }),
    date: day.date,
    alignment: day.overallAlignment,
  }));

  // Chart Data: Last 30 days
  const last30Days = historyData.slice(-30);
  const monthlyAlignmentData = last30Days.map((day) => ({
    day: new Date(day.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    date: day.date,
    alignment: day.overallAlignment,
  }));

  // 6. Activity Performance
  const activeActivities = activities.filter((a) => !a.archived);
  const activityPerformance = activeActivities.map((activity) => {
    const actEntries = allEntries.filter(
      (e) => e.activityId === activity.id && e.status !== "skipped" && e.status !== "pending"
    );
    const avgScore =
      actEntries.length > 0
        ? Math.round(
            actEntries.reduce((sum, e) => sum + e.alignmentScore, 0) /
              actEntries.length
          )
        : 0;

    const totalScheduled = allEntries.filter((e) => e.activityId === activity.id).length;

    return {
      name: activity.title,
      score: avgScore,
      color: activity.color,
      completionRate:
        totalScheduled > 0
          ? Math.round((actEntries.length / totalScheduled) * 100)
          : 0,
    };
  });

  // 7. Time Deviation Analysis
  const deviationAnalysis = activeActivities.map((activity) => {
    const actEntries = allEntries.filter(
      (e) => e.activityId === activity.id && e.status !== "skipped" && e.status !== "pending"
    );
    const avgDev =
      actEntries.length > 0
        ? Math.round(
            actEntries.reduce((sum, e) => sum + e.deviation, 0) /
              actEntries.length
          )
        : 0;

    return {
      name: activity.title,
      avgDeviation: avgDev,
      color: activity.color,
    };
  });

  // 8. Heatmap data (last 90 days)
  const heatmapData = historyData.slice(-90).map((day) => ({
    date: day.date,
    value: day.overallAlignment,
  }));

  // 9. Weekly Report Card
  const weeklyReport = generateWeeklyReport(activeActivities, historyData);

  // 10. Achievements
  const achievements = evaluateAchievements(overallStats, historyData);

  // 11. Insights
  const insights = generateInsights(activeActivities, allEntries);

  return {
    historyData,
    overallStats,
    weeklyAlignmentData,
    monthlyAlignmentData,
    activityPerformance,
    deviationAnalysis,
    heatmapData,
    weeklyReport,
    achievements,
    insights,
  };
}

// ── Helper: Calculate Streaks ───────────────────────────────────────
function calculateStreakFromHistory(history: DayRecord[]): {
  current: number;
  longest: number;
} {
  let current = 0;
  let longest = 0;
  let tempStreak = 0;

  // We need to calculate streaks. If today doesn't have an entry yet (or has pending entries only),
  // we check if yesterday's streak is still alive.
  const todayStr = new Date().toISOString().split("T")[0];
  let checkStartIndex = history.length - 1;

  if (history.length > 0 && history[history.length - 1].date === todayStr) {
    const todayRecord = history[history.length - 1];
    const hasCompletedSome = todayRecord.entries.some(
      (e) => e.status !== "pending" && e.status !== "skipped"
    );
    
    // If today exists but hasn't had any completed check-ins yet, start checking from yesterday
    if (!hasCompletedSome) {
      checkStartIndex = history.length - 2;
    }
  }

  // Calculate current streak traversing backwards
  let currentStreakBroken = false;
  for (let i = checkStartIndex; i >= 0; i--) {
    if (history[i].overallAlignment >= 60) {
      if (!currentStreakBroken) {
        current++;
      }
    } else {
      currentStreakBroken = true;
      break;
    }
  }

  // Calculate longest streak scanning forward
  for (let i = 0; i < history.length; i++) {
    if (history[i].overallAlignment >= 60) {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  longest = Math.max(longest, tempStreak);

  return { current, longest };
}

// ── Helper: Generate Weekly Report ──────────────────────────────────
function generateWeeklyReport(
  activities: Activity[],
  history: DayRecord[]
): WeeklyReport {
  const last7Days = history.slice(-7);
  
  if (last7Days.length === 0 || activities.length === 0) {
    return {
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
  }

  const allWeeklyEntries = last7Days.flatMap((day) => day.entries);
  const completed = allWeeklyEntries.filter(
    (e) => e.status !== "skipped" && e.status !== "pending"
  );
  const skipped = allWeeklyEntries.filter((e) => e.status === "skipped");

  const avgDev =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, e) => sum + Math.abs(e.deviation), 0) /
            completed.length
        )
      : 0;

  // Best & Worst activities
  let best = { name: "None", score: 0 };
  let worst = { name: "None", score: 100 };
  let hasActivityData = false;

  activities.forEach((activity) => {
    const actEntries = allWeeklyEntries.filter(
      (e) => e.activityId === activity.id && e.status !== "skipped" && e.status !== "pending"
    );

    if (actEntries.length > 0) {
      hasActivityData = true;
      const score = Math.round(
        actEntries.reduce((sum, e) => sum + e.alignmentScore, 0) /
          actEntries.length
      );

      if (score > best.score) {
        best = { name: activity.title, score };
      }
      if (score < worst.score) {
        worst = { name: activity.title, score };
      }
    }
  });

  if (!hasActivityData) {
    worst = { name: "None", score: 0 };
  }

  const consistencyScore =
    last7Days.length > 0
      ? Math.round(
          last7Days.reduce((sum, d) => sum + d.overallAlignment, 0) /
            last7Days.length
        )
      : 0;

  // Calculate compared to previous week
  const previousWeek = history.slice(-14, -7);
  const previousConsistency =
    previousWeek.length > 0
      ? Math.round(
          previousWeek.reduce((sum, d) => sum + d.overallAlignment, 0) /
            previousWeek.length
        )
      : 0;

  const comparedToPreviousWeek = consistencyScore - previousConsistency;

  return {
    weekOf: last7Days[0].date,
    bestActivity: best,
    worstActivity: worst,
    averageDeviation: avgDev,
    consistencyScore,
    totalEntries: allWeeklyEntries.length,
    completedEntries: completed.length,
    skippedEntries: skipped.length,
    comparedToPreviousWeek,
  };
}

// ── Helper: Evaluate Achievements ──────────────────────────────────
function evaluateAchievements(
  stats: { currentStreak: number; longestStreak: number; totalEntries: number },
  history: DayRecord[]
): Achievement[] {
  const mockAchievements: Achievement[] = [
    {
      id: "ach-1",
      title: "First Steps",
      description: "Complete your first day with 80%+ alignment",
      icon: "Award",
      unlockedAt: null,
      requirement: 80,
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
  ];

  const firstDay80 = history.find((d) => d.overallAlignment >= 80);
  const perfectDay = history.find((d) => d.overallAlignment === 100);

  return mockAchievements.map((ach) => {
    let unlockedAt: string | null = null;

    if (ach.id === "ach-1" && firstDay80) {
      unlockedAt = firstDay80.date;
    } else if (ach.id === "ach-6" && perfectDay) {
      unlockedAt = perfectDay.date;
    } else if (ach.type === "streak" && stats.longestStreak >= ach.requirement) {
      unlockedAt = new Date().toISOString().split("T")[0]; // Approximate unlocked date
    } else if (
      ach.type === "completion" &&
      stats.totalEntries >= ach.requirement
    ) {
      unlockedAt = new Date().toISOString().split("T")[0];
    }

    return {
      ...ach,
      unlockedAt,
    };
  });
}

// ── Helper: Generate Dynamic AI Insights ─────────────────────────────
function generateInsights(
  activities: Activity[],
  allEntries: DailyEntry[]
): InsightCard[] {
  const insights: InsightCard[] = [];

  const completed = allEntries.filter(
    (e) => e.status !== "skipped" && e.status !== "pending"
  );
  if (completed.length < 2) {
    return []; // Not enough data — need at least 2 completed entries
  }

  // 1. Check for best aligned activity (Strength) — lowered threshold to 75%
  let bestAct: Activity | null = null;
  let bestScore = 0;

  activities.forEach((act) => {
    const actEntries = completed.filter((e) => e.activityId === act.id);
    if (actEntries.length >= 1) {
      const avg =
        actEntries.reduce((sum, e) => sum + e.alignmentScore, 0) /
        actEntries.length;
      if (avg > bestScore && avg >= 75) {
        bestScore = avg;
        bestAct = act;
      }
    }
  });

  if (bestAct) {
    insights.push({
      id: "in-1",
      type: "strength",
      icon: "Trophy",
      title: "Strong Routine Pillar",
      description: `Your execution of "${(bestAct as Activity).title}" is exceptionally aligned, averaging ${Math.round(bestScore)}% accuracy. Keep leveraging this momentum!`,
      metric: `${Math.round(bestScore)}%`,
      metricLabel: "alignment",
      color: "#67C587",
    });
  }

  // 2. Check for worst aligned activity (Improvement suggestion) — widened range to <80%
  let worstAct: Activity | null = null;
  let worstScore = 100;
  let worstAvgDev = 0;

  activities.forEach((act) => {
    const actEntries = completed.filter((e) => e.activityId === act.id);
    if (actEntries.length >= 1) {
      const avg =
        actEntries.reduce((sum, e) => sum + e.alignmentScore, 0) /
        actEntries.length;
      const dev =
        actEntries.reduce((sum, e) => sum + e.deviation, 0) / actEntries.length;
      if (avg < worstScore && avg < 80) {
        worstScore = avg;
        worstAct = act;
        worstAvgDev = dev;
      }
    }
  });

  if (worstAct) {
    const devText =
      worstAvgDev > 0
        ? `late by an average of ${Math.round(worstAvgDev)} minutes`
        : `early by an average of ${Math.round(Math.abs(worstAvgDev))} minutes`;

    insights.push({
      id: "in-2",
      type: "improvement",
      icon: "AlertTriangle",
      title: `Optimize ${(worstAct as Activity).title}`,
      description: `You run ${devText}. Consider adjusting the ideal time or expanding your flexibility window.`,
      metric: `${Math.round(Math.abs(worstAvgDev))}m`,
      metricLabel: worstAvgDev > 0 ? "avg delay" : "avg early",
      color: "#E89A73",
    });
  }

  // 3. Overall Trend insight — lowered from 13 entries to 6, and diff threshold from 5% to 3%
  const recentEntries = completed.slice(-5);
  const oldEntries = completed.slice(0, -5);
  if (recentEntries.length >= 3 && oldEntries.length >= 3) {
    const recentAvg =
      recentEntries.reduce((sum, e) => sum + e.alignmentScore, 0) /
      recentEntries.length;
    const oldAvg =
      oldEntries.reduce((sum, e) => sum + e.alignmentScore, 0) /
      oldEntries.length;

    const diff = recentAvg - oldAvg;
    if (diff > 3) {
      insights.push({
        id: "in-3",
        type: "trend",
        icon: "TrendingUp",
        title: "Consistency Upward Trend",
        description: `Your average alignment increased by +${Math.round(diff)}% over your last 5 activities compared to your earlier routines.`,
        metric: `+${Math.round(diff)}%`,
        metricLabel: "vs baseline",
        color: "#3B82F6",
      });
    } else if (diff < -3) {
      insights.push({
        id: "in-3b",
        type: "improvement",
        icon: "TrendingUp",
        title: "Alignment Dipping",
        description: `Your recent alignment dropped by ${Math.round(Math.abs(diff))}% compared to your earlier entries. Try to stick closer to your scheduled times.`,
        metric: `${Math.round(diff)}%`,
        metricLabel: "vs baseline",
        color: "#E89A73",
      });
    }
  }

  // 4. Consistency / Skip Rate insight
  const totalEntries = allEntries.filter((e) => e.status !== "pending");
  const skippedEntries = totalEntries.filter((e) => e.status === "skipped");
  if (totalEntries.length >= 3) {
    const skipRate = Math.round((skippedEntries.length / totalEntries.length) * 100);
    const completionRate = 100 - skipRate;

    if (skipRate > 30) {
      insights.push({
        id: "in-4",
        type: "improvement",
        icon: "XCircle",
        title: "High Skip Rate",
        description: `You've skipped ${skipRate}% of your scheduled activities. Consider reducing the number of activities or adjusting times to be more realistic.`,
        metric: `${skipRate}%`,
        metricLabel: "skipped",
        color: "#E89A73",
      });
    } else if (completionRate >= 80 && totalEntries.length >= 5) {
      insights.push({
        id: "in-4b",
        type: "achievement",
        icon: "Calendar",
        title: "Great Consistency",
        description: `You've completed ${completionRate}% of your scheduled activities. Your commitment to your routine is impressive — keep it up!`,
        metric: `${completionRate}%`,
        metricLabel: "completion",
        color: "#67C587",
      });
    }
  }

  // 5. Time-of-day pattern insight
  if (completed.length >= 3) {
    const morningEntries = completed.filter((e) => {
      const hour = parseInt(e.idealTime.split(":")[0], 10);
      return hour < 12;
    });
    const eveningEntries = completed.filter((e) => {
      const hour = parseInt(e.idealTime.split(":")[0], 10);
      return hour >= 12;
    });

    if (morningEntries.length >= 2 && eveningEntries.length >= 2) {
      const morningAvg =
        morningEntries.reduce((sum, e) => sum + e.alignmentScore, 0) /
        morningEntries.length;
      const eveningAvg =
        eveningEntries.reduce((sum, e) => sum + e.alignmentScore, 0) /
        eveningEntries.length;

      const diff = morningAvg - eveningAvg;
      if (Math.abs(diff) > 10) {
        const betterTime = diff > 0 ? "morning" : "evening";
        const betterAvg = Math.round(diff > 0 ? morningAvg : eveningAvg);
        insights.push({
          id: "in-5",
          type: "trend",
          icon: diff > 0 ? "Sun" : "Moon",
          title: `Stronger ${betterTime.charAt(0).toUpperCase() + betterTime.slice(1)} Routine`,
          description: `Your ${betterTime} activities average ${betterAvg}% alignment — ${Math.round(Math.abs(diff))}% higher than your ${diff > 0 ? "evening" : "morning"} routine. Consider scheduling important tasks during your stronger period.`,
          metric: `${betterAvg}%`,
          metricLabel: `${betterTime} avg`,
          color: diff > 0 ? "#F59E0B" : "#8B5CF6",
        });
      }
    }
  }

  // Default fallback if nothing triggered
  if (insights.length === 0) {
    insights.push({
      id: "in-default",
      type: "trend",
      icon: "Calendar",
      title: "Building Momentum",
      description: "Log your activities daily. The AI will start identifying time-drift trends and highlighting consistency gains once you log a few more routines.",
      color: "#A78BFA",
    });
  }

  return insights;
}

// ── Helper: Get Detail metrics for a single activity ──────────────────
export function getActivityDetailFromHistory(
  activity: Activity,
  allEntries: DailyEntry[]
) {
  const actEntries = allEntries.filter((e) => e.activityId === activity.id);
  const completed = actEntries.filter(
    (e) => e.status !== "skipped" && e.status !== "pending"
  );

  const avgScore =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, e) => sum + e.alignmentScore, 0) /
            completed.length
        )
      : 0;

  const avgDelay =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, e) => sum + Math.abs(e.deviation), 0) /
            completed.length
        )
      : 0;

  const completionRate =
    actEntries.length > 0
      ? Math.round((completed.length / actEntries.length) * 100)
      : 0;

  // Group entries by date
  const entriesByDate: Record<string, DailyEntry> = {};
  actEntries.forEach((entry) => {
    entriesByDate[entry.date] = entry;
  });

  // Sort dates
  const sortedDates = Object.keys(entriesByDate).sort();

  // Return last 7 entries for weekly trend
  const weeklyTrend = sortedDates.slice(-7).map((dateStr) => {
    const entry = entriesByDate[dateStr];
    return {
      day: new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" }),
      score: entry.alignmentScore,
      deviation: entry.deviation,
    };
  });

  // Return last 30 entries for monthly trend
  const monthlyTrend = sortedDates.slice(-30).map((dateStr) => {
    const entry = entriesByDate[dateStr];
    return {
      day: new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      score: entry.alignmentScore,
    };
  });

  // Detailed recent history
  const history = sortedDates.slice(-30).map((dateStr) => {
    const entry = entriesByDate[dateStr];
    return {
      date: dateStr,
      status: entry.status,
      actualTime: entry.actualTime,
      deviation: entry.deviation,
      alignmentScore: entry.alignmentScore,
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
