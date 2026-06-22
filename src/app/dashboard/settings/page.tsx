"use client";

import { motion } from "framer-motion";
import {
  User,
  CalendarClock,
  Crown,
  Mail,
  LogOut,
} from "lucide-react";
import { useApp } from "@/contexts/app-context";

export default function SettingsPage() {
  const { user, settings, updateSettings, updateProfile, setShowUpgradeModal, signOut } = useApp();

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

        {/* Schedule Config */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-chart-3" />
            <h2 className="text-lg font-semibold">Default Schedule Config</h2>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Default Flexibility Window</label>
            <p className="mb-3 text-xs text-muted-foreground">
              This will be the default flexibility window when you create a new activity.
            </p>
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
          transition={{ delay: 0.2 }}
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

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <LogOut className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-semibold">Logout</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Sign out of your account on this device.
          </p>
          <button
            onClick={() => signOut()}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-5 text-sm font-medium text-destructive transition-all hover:bg-destructive/20 hover:border-destructive/50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

