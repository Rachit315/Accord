"use client";

import { motion } from "framer-motion";
import {
  User,
  Bell,
  Palette,
  CalendarClock,
  Crown,
  Download,
  Mail,
  Clock,
} from "lucide-react";
import { useApp } from "@/contexts/app-context";

export default function SettingsPage() {
  const { user, settings, updateSettings, updateProfile, setShowUpgradeModal } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-xl font-bold">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
                <div className="text-xs text-muted-foreground">Joined {new Date(user.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none transition-colors focus:border-primary/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => updateProfile({ email: e.target.value })}
                    className="h-11 w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: "dailyReminder" as const, label: "Daily Reminders", desc: "Get reminded before each activity" },
              { key: "weeklyReport" as const, label: "Weekly Report", desc: "Receive a weekly alignment summary" },
              { key: "streakAlerts" as const, label: "Streak Alerts", desc: "Get notified about streak milestones" },
              { key: "insightNotifications" as const, label: "Insight Notifications", desc: "New insights and suggestions" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
                <button
                  onClick={() =>
                    updateSettings({
                      notifications: {
                        ...settings.notifications,
                        [item.key]: !settings.notifications[item.key],
                      },
                    })
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.notifications[item.key] ? "bg-primary" : "bg-border"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      settings.notifications[item.key] ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <div className="text-sm font-medium">Reminder Time</div>
                <div className="text-xs text-muted-foreground">Default time for daily reminders</div>
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="time"
                  value={settings.notifications.reminderTime}
                  onChange={(e) =>
                    updateSettings({
                      notifications: { ...settings.notifications, reminderTime: e.target.value },
                    })
                  }
                  className="h-9 rounded-lg border border-border bg-background/50 pl-10 pr-3 text-sm outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-chart-4" />
            <h2 className="text-lg font-semibold">Theme</h2>
          </div>
          <div className="flex gap-3">
            {(["dark", "light"] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => updateSettings({ theme })}
                className={`flex-1 rounded-xl border p-4 text-center transition-all ${
                  settings.theme === theme
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card/50 hover:border-primary/30"
                }`}
              >
                <div className={`mx-auto mb-2 h-10 w-10 rounded-lg ${theme === "dark" ? "bg-[#0A0A0F]" : "bg-white border border-gray-200"}`} />
                <div className="text-sm font-medium capitalize">{theme}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Schedule Config */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-chart-3" />
            <h2 className="text-lg font-semibold">Schedule Config</h2>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Default Flexibility Window</label>
            <select
              value={settings.defaultFlexibility}
              onChange={(e) => updateSettings({ defaultFlexibility: Number(e.target.value) })}
              className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
            >
              {[5, 10, 15, 20, 30, 45, 60].map((v) => (
                <option key={v} value={v}>±{v} minutes</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-chart-5" />
            <h2 className="text-lg font-semibold">Subscription</h2>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-card/50 p-4">
            <div>
              <div className="text-sm font-medium">
                Current Plan: <span className="capitalize text-primary">{user.plan}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {user.plan === "free" ? "5 activities • 7-day history" : "Unlimited activities • 90-day history"}
              </div>
            </div>
            {user.plan === "free" && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                <Crown className="h-3.5 w-3.5" /> Upgrade
              </button>
            )}
          </div>
        </motion.div>

        {/* Data Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Data Export</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Download your routine data for external analysis.
          </p>
          <div className="flex gap-3">
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium transition-colors hover:bg-card">
              <Download className="h-4 w-4" /> Export JSON
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium transition-colors hover:bg-card">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
