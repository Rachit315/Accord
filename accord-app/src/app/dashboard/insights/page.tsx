"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  AlertTriangle,
  TrendingUp,
  XCircle,
  Calendar,
  Sun,
  Flame,
  Moon,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { mockInsights } from "@/lib/mock-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy, AlertTriangle, TrendingUp, XCircle, Calendar, Sun, Flame, Moon,
};

const typeConfig = {
  strength: { label: "Strength", bgBadge: "bg-primary/10 text-primary" },
  improvement: { label: "Improve", bgBadge: "bg-secondary/10 text-secondary" },
  trend: { label: "Trend", bgBadge: "bg-chart-3/10 text-chart-3" },
  achievement: { label: "Achievement", bgBadge: "bg-chart-5/10 text-chart-5" },
};

export default function InsightsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold sm:text-3xl">Insights</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-powered analysis of your routine patterns
        </p>
      </div>

      {mockInsights.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/20 py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lightbulb className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Not enough data for insights</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Log your daily activities for a few days, and Accord's AI will start generating smart insights, trends, and improvement tips tailored to your routine.
          </p>
          <a
            href="/dashboard/daily-entry"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
          >
            Go to Daily Entries
          </a>
        </div>
      ) : (
        <>
          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card mb-8 rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="mb-1 text-lg font-semibold">Weekly Summary</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Your routine alignment has been steadily improving. This week, you achieved an average
                  alignment score of <span className="font-medium text-primary">87%</span>, up from 74% last week.
                  Your mornings are strong, but evenings need attention. Focus on keeping Dinner and Sleep
                  closer to their ideal times for the biggest improvement.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Insight Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {mockInsights.map((insight, index) => {
              const IconComponent = iconMap[insight.icon] || Sparkles;
              const typeInfo = typeConfig[insight.type];

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + index * 0.08 }}
                  className="glass-card glass-card-hover rounded-xl p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${insight.color}15`, color: insight.color }}
                      >
                        <IconComponent className="h-4.5 w-4.5" />
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${typeInfo.bgBadge}`}>
                        {typeInfo.label}
                      </span>
                    </div>
                    {insight.metric && (
                      <div className="text-right">
                        <div className="text-xl font-bold" style={{ color: insight.color }}>
                          {insight.metric}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{insight.metricLabel}</div>
                      </div>
                    )}
                  </div>
                  <h3 className="mb-1 text-sm font-semibold">{insight.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{insight.description}</p>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}
