"use client";

import { motion } from "framer-motion";
import {
  Target,
  Flame,
  Activity,
  ClipboardCheck,
  TrendingUp,
  Award,
  Calendar,
  Lock,
} from "lucide-react";
import { useApp } from "@/contexts/app-context";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useState } from "react";

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="font-medium">{label}</div>
      <div className="text-primary">{payload[0].value}%</div>
    </div>
  );
}

// Heatmap component accepting dynamic data
function Heatmap({ data }: { data: { date: string; value: number }[] }) {
  if (data.length === 0) return null;

  const weeks: { date: string; value: number }[][] = [];
  let currentWeek: { date: string; value: number }[] = [];

  // Get the day of week for the first date
  const firstDate = new Date(data[0].date);
  const firstDay = firstDate.getDay();
  // Pad start
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push({ date: "", value: -1 });
  }

  data.forEach((d) => {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push({ date: "", value: -1 });
    weeks.push(currentWeek);
  }

  const getColor = (value: number) => {
    if (value < 0) return "transparent";
    if (value === 0) return "#1A1A24";
    if (value < 40) return "#1a3a2a";
    if (value < 60) return "#2a5a3a";
    if (value < 80) return "#3a7a4a";
    return "#67C587";
  };

  const months: string[] = [];
  let lastMonth = "";
  weeks.forEach((week) => {
    const validDay = week.find((d) => d.date);
    if (validDay) {
      const m = new Date(validDay.date).toLocaleDateString("en-US", { month: "short" });
      if (m !== lastMonth) {
        months.push(m);
        lastMonth = m;
      } else {
        months.push("");
      }
    } else {
      months.push("");
    }
  });

  return (
    <div>
      <div className="mb-2 flex gap-[3px] text-[10px] text-muted-foreground pl-8">
        {months.map((m, i) => (
          <div key={i} className="w-[14px] text-center">{m}</div>
        ))}
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-[3px] text-[10px] text-muted-foreground mr-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="flex h-[14px] items-center">{i % 2 === 1 ? d : ""}</div>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  className="h-[14px] w-[14px] rounded-[3px] transition-colors"
                  style={{ backgroundColor: getColor(day.value) }}
                  title={day.date ? `${day.date}: ${day.value}%` : ""}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <span>Less</span>
        {["#1A1A24", "#1a3a2a", "#2a5a3a", "#3a7a4a", "#67C587"].map((c) => (
          <div key={c} className="h-[10px] w-[10px] rounded-[2px]" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function ProgressSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-48 bg-muted rounded mb-2" />
        <div className="h-4 w-72 bg-muted rounded" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-muted rounded-xl" />
        ))}
      </div>

      <div className="h-80 bg-muted rounded-xl" />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 bg-muted rounded-xl" />
        <div className="h-80 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { stats: computedStats, isLoading, user, setShowUpgradeModal } = useApp();
  const [chartRange, setChartRange] = useState<"weekly" | "monthly">("weekly");

  if (isLoading) {
    return <ProgressSkeleton />;
  }

  const {
    overallStats: stats,
    weeklyAlignmentData: weeklyData,
    monthlyAlignmentData: monthlyData,
    activityPerformance: performanceData,
    deviationAnalysis: deviationData,
    heatmapData,
    weeklyReport: report,
    achievements,
  } = computedStats;

  const chartData = chartRange === "weekly" ? weeklyData : monthlyData;

  const statCards = [
    {
      icon: Target,
      label: "Alignment Score",
      value: `${stats.alignmentScore}%`,
      color: "#67C587",
      desc: "Overall average",
    },
    {
      icon: Flame,
      label: "Current Streak",
      value: `${stats.currentStreak}`,
      color: "#E89A73",
      desc: "days",
    },
    {
      icon: Activity,
      label: "Activities",
      value: `${stats.totalActivities}`,
      color: "#3B82F6",
      desc: "Active routines",
    },
    {
      icon: ClipboardCheck,
      label: "Entries Logged",
      value: `${stats.totalEntries}`,
      color: "#8B5CF6",
      desc: "Total completions",
    },
  ];

  if (stats.totalEntries === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">Progress</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your alignment and consistency over time
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/20 py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <TrendingUp className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No progress data yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Start logging your daily entries to see your alignment trends, activity performance, and streaks over time.
          </p>
          <a
            href="/dashboard/daily-entry"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
          >
            Go to Daily Entries
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your alignment and consistency over time
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className="glass-card glass-card-hover rounded-xl p-5"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${stat.color}15` }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Alignment Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="glass-card mb-6 rounded-xl p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Alignment Trend</h2>
          <div className="flex rounded-lg border border-border bg-background/50 p-0.5">
            {(["weekly", "monthly"] as const).map((range) => {
              const isLocked = range === "monthly" && user.plan === "free";
              return (
                <button
                  key={range}
                  onClick={() => {
                    if (isLocked) {
                      setShowUpgradeModal(true);
                    } else {
                      setChartRange(range);
                    }
                  }}
                  className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    chartRange === range && !isLocked
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {range === "weekly" ? "7 Days" : "30 Days"}
                  {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                </button>
              );
            })}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorAlignment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#67C587" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#67C587" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
            <XAxis dataKey="day" tick={{ fill: "#8E8E9A", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#8E8E9A", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="alignment" stroke="#67C587" strokeWidth={2} fill="url(#colorAlignment)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Activity Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#8E8E9A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#8E8E9A", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip
                contentStyle={{ backgroundColor: "#13131A", border: "1px solid #2A2A35", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#F5F5F7" }}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
                {performanceData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Time Deviation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Time Deviation Analysis</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deviationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#8E8E9A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#8E8E9A", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip
                contentStyle={{ backgroundColor: "#13131A", border: "1px solid #2A2A35", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#F5F5F7" }}
                formatter={(value: any) => [`${value} min`, "Avg Deviation"]}
              />
              <Bar dataKey="avgDeviation" radius={[0, 4, 4, 0]} barSize={18}>
                {deviationData.map((entry, index) => (
                  <Cell key={index} fill={entry.avgDeviation > 0 ? "#E89A73" : "#67C587"} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="glass-card mt-6 rounded-xl p-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">90-Day Consistency</h2>
        </div>
        <div className="overflow-x-auto">
          <Heatmap data={heatmapData} />
        </div>
      </motion.div>

      {/* Streaks & Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="glass-card mt-6 rounded-xl p-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-secondary" />
          <h2 className="text-lg font-semibold">Streaks & Achievements</h2>
        </div>

        {/* Streak display */}
        <div className="mb-6 flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-secondary">{stats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <div className="text-4xl font-bold text-muted-foreground">{stats.longestStreak}</div>
            <div className="text-xs text-muted-foreground">Longest Streak</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-xl border p-3 text-center transition-all ${
                achievement.unlockedAt
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-card/30 opacity-50"
              }`}
            >
              <div className="mb-1 text-2xl">
                {achievement.unlockedAt ? "🏆" : "🔒"}
              </div>
              <div className="text-xs font-semibold">{achievement.title}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">{achievement.description}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
        className="glass-card mt-6 rounded-xl p-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-chart-3" />
          <h2 className="text-lg font-semibold">Weekly Report Card</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-card/50 p-4">
            <div className="text-xs text-muted-foreground">Best Activity</div>
            <div className="mt-1 text-sm font-semibold text-primary">{report.bestActivity.name}</div>
            <div className="text-lg font-bold text-primary">{report.bestActivity.score}%</div>
          </div>
          <div className="rounded-xl bg-card/50 p-4">
            <div className="text-xs text-muted-foreground">Worst Activity</div>
            <div className="mt-1 text-sm font-semibold text-secondary">{report.worstActivity.name}</div>
            <div className="text-lg font-bold text-secondary">{report.worstActivity.score}%</div>
          </div>
          <div className="rounded-xl bg-card/50 p-4">
            <div className="text-xs text-muted-foreground">Avg Deviation</div>
            <div className="mt-1 text-lg font-bold">{report.averageDeviation} min</div>
          </div>
          <div className="rounded-xl bg-card/50 p-4">
            <div className="text-xs text-muted-foreground">Consistency</div>
            <div className="mt-1 text-lg font-bold">{report.consistencyScore}%</div>
            <div className="flex items-center gap-1 text-xs text-primary">
              <TrendingUp className="h-3 w-3" /> {report.comparedToPreviousWeek >= 0 ? `+${report.comparedToPreviousWeek}` : report.comparedToPreviousWeek}% vs last week
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
