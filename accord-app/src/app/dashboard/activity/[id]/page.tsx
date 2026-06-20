"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Target,
  Percent,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sunrise,
  Brain,
  Coffee,
  BookOpen,
  Dumbbell,
  UtensilsCrossed,
  Laptop,
  ChefHat,
  Footprints,
  Moon,
} from "lucide-react";
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
} from "recharts";
import { getActivityDetail } from "@/lib/mock-data";
import { formatTime } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sunrise, Brain, Coffee, BookOpen, Dumbbell, UtensilsCrossed, Laptop, ChefHat, Footprints, Moon,
};

export default function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const detail = getActivityDetail(id);

  if (!detail) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold">Activity not found</h2>
          <button onClick={() => router.back()} className="text-sm text-primary">Go back</button>
        </div>
      </div>
    );
  }

  const { activity, performanceScore, completionRate, averageDelay, weeklyTrend, monthlyTrend, history } = detail;
  const IconComponent = iconMap[activity.icon] || Clock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${activity.color}15`, color: activity.color }}
        >
          <IconComponent className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{activity.title}</h1>
          <p className="text-sm text-muted-foreground">
            Ideal time: {formatTime(activity.idealTime)} • ±{activity.flexibilityWindow} min flexibility
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-5 text-center"
        >
          <Target className="mx-auto mb-2 h-5 w-5 text-primary" />
          <div className="text-3xl font-bold text-primary">{performanceScore}%</div>
          <div className="text-xs text-muted-foreground">Performance Score</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-xl p-5 text-center"
        >
          <Percent className="mx-auto mb-2 h-5 w-5 text-chart-3" />
          <div className="text-3xl font-bold text-chart-3">{completionRate}%</div>
          <div className="text-xs text-muted-foreground">Completion Rate</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-5 text-center"
        >
          <Clock className="mx-auto mb-2 h-5 w-5 text-secondary" />
          <div className="text-3xl font-bold text-secondary">{averageDelay}m</div>
          <div className="text-xs text-muted-foreground">Avg Delay</div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Weekly Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activity.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={activity.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
              <XAxis dataKey="day" tick={{ fill: "#8E8E9A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#8E8E9A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#13131A", border: "1px solid #2A2A35", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#F5F5F7" }}
              />
              <Area type="monotone" dataKey="score" stroke={activity.color} strokeWidth={2} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Monthly Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
              <XAxis dataKey="day" tick={{ fill: "#8E8E9A", fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis domain={[0, 100]} tick={{ fill: "#8E8E9A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#13131A", border: "1px solid #2A2A35", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#F5F5F7" }}
              />
              <Bar dataKey="score" fill={activity.color} fillOpacity={0.7} radius={[2, 2, 0, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* History Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card mt-6 rounded-xl p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">Recent History</h2>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {history.slice().reverse().map((entry, i) => {
            const statusIcon =
              entry.status === "on-time" ? <CheckCircle2 className="h-4 w-4 text-primary" /> :
              entry.status === "late" ? <AlertCircle className="h-4 w-4 text-secondary" /> :
              entry.status === "early" ? <Clock className="h-4 w-4 text-chart-3" /> :
              <XCircle className="h-4 w-4 text-destructive" />;

            return (
              <div key={i} className="flex items-center justify-between rounded-lg bg-card/50 px-4 py-2.5">
                <div className="flex items-center gap-3">
                  {statusIcon}
                  <span className="text-sm">{new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-4">
                  {entry.actualTime ? (
                    <span className="text-xs text-muted-foreground">{formatTime(entry.actualTime)}</span>
                  ) : (
                    <span className="text-xs text-destructive">Skipped</span>
                  )}
                  <span className={`text-sm font-semibold ${
                    entry.alignmentScore >= 80 ? "text-primary" :
                    entry.alignmentScore >= 50 ? "text-secondary" :
                    "text-destructive"
                  }`}>
                    {entry.alignmentScore}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
