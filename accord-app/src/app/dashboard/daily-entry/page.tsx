"use client";

import { motion } from "framer-motion";
import {
  Check,
  X,
  Clock,
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
  CheckCircle2,
  AlertCircle,
  MinusCircle,
  ArrowUp,
  ArrowDown,
  ClipboardList,
} from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { formatTime, formatDifference } from "@/lib/utils";
import { EntryStatus } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sunrise, Brain, Coffee, BookOpen, Dumbbell, UtensilsCrossed, Laptop, ChefHat, Footprints, Moon,
};

const statusConfig: Record<EntryStatus, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "Pending", color: "text-muted-foreground", bgColor: "bg-muted/50", icon: Clock },
  "on-time": { label: "On Time", color: "text-primary", bgColor: "bg-primary/10", icon: CheckCircle2 },
  late: { label: "Late", color: "text-secondary", bgColor: "bg-secondary/10", icon: ArrowDown },
  early: { label: "Early", color: "text-chart-3", bgColor: "bg-chart-3/10", icon: ArrowUp },
  skipped: { label: "Skipped", color: "text-destructive", bgColor: "bg-destructive/10", icon: MinusCircle },
};

export default function DailyEntryPage() {
  const { activities, todayEntries, markDone, skipEntry } = useApp();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const completed = todayEntries.filter((e) => e.status !== "pending" && e.status !== "skipped").length;
  const total = todayEntries.length;
  const skipped = todayEntries.filter((e) => e.status === "skipped").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Daily Entry</h1>
        <p className="mt-1 text-sm text-muted-foreground">{today}</p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{completed}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-muted-foreground">{total - completed - skipped}</div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-destructive">{skipped}</div>
          <div className="text-xs text-muted-foreground">Skipped</div>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {todayEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/20 py-20 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ClipboardList className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No entries for today</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              You haven't scheduled any activities for today. Head over to the Schedule tab to start designing your day!
            </p>
            <a
              href="/dashboard/schedule"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
            >
              Go to Schedule
            </a>
          </motion.div>
        ) : (
          todayEntries.map((entry, index) => {
            const activity = activities.find((a) => a.id === entry.activityId);
            if (!activity) return null;

            const IconComponent = iconMap[activity.icon] || Clock;
            const status = statusConfig[entry.status];
            const StatusIcon = status.icon;
            const isPending = entry.status === "pending";

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`glass-card overflow-hidden rounded-xl transition-all ${
                  !isPending && entry.status !== "skipped" ? "border-l-4" : ""
                }`}
                style={{
                  borderLeftColor:
                    entry.status === "on-time"
                      ? "#67C587"
                      : entry.status === "late"
                      ? "#E89A73"
                      : entry.status === "early"
                      ? "#3B82F6"
                      : undefined,
                }}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${activity.color}15`, color: activity.color }}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{activity.title}</h3>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            Ideal: {formatTime(entry.idealTime)}
                          </span>
                          {entry.actualTime && (
                            <>
                              <span className="text-xs text-muted-foreground">
                                Actual: {formatTime(entry.actualTime)}
                              </span>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.bgColor} ${status.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                {formatDifference(entry.deviation)}
                              </span>
                            </>
                          )}
                          {entry.status === "skipped" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                              <MinusCircle className="h-3 w-3" />
                              Skipped
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => markDone(entry.id)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary/10 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Mark Done
                        </button>
                        <button
                          onClick={() => skipEntry(entry.id)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-destructive/10 px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
                        >
                          <X className="h-3.5 w-3.5" />
                          Skip
                        </button>
                      </div>
                    )}

                    {!isPending && entry.status !== "skipped" && (
                      <div className="text-right">
                        <div className={`text-lg font-bold ${status.color}`}>
                          {entry.alignmentScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">alignment</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
