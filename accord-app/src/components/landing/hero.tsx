"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient" />

      {/* Animated orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="pointer-events-none absolute -right-32 bottom-1/4 h-[400px] w-[400px] rounded-full bg-secondary/10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-sm backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-muted-foreground">Now in public beta</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Design your{" "}
          <span className="gradient-text">ideal day.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Track how closely your real life matches the routine you want to live.
          Build better habits with alignment tracking, smart insights, and progress analytics.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/auth/signup"
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
          >
            Start Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <button className="group inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card/50 px-8 text-base font-medium backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card">
            <Play className="h-4 w-4 text-primary" />
            Watch Demo
          </button>
        </motion.div>

        {/* Preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
          className="relative mx-auto mt-20 max-w-4xl"
        >
          <div className="glass-card overflow-hidden rounded-2xl border border-border/50 p-1">
            <div className="rounded-xl bg-card p-1">
              {/* Mock dashboard header */}
              <div className="flex items-center gap-2 rounded-t-lg bg-surface-elevated px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <div className="ml-4 flex-1 rounded-md bg-background/50 px-3 py-1 text-xs text-muted-foreground">
                  accord.app/dashboard
                </div>
              </div>
              {/* Mock dashboard content */}
              <div className="grid grid-cols-12 gap-3 p-4">
                {/* Sidebar mock */}
                <div className="col-span-3 hidden space-y-2 rounded-lg bg-background/50 p-3 md:block">
                  {["Schedule", "Daily Entry", "Progress", "Insights"].map((item, i) => (
                    <div
                      key={item}
                      className={`rounded-md px-3 py-2 text-xs ${
                        i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
                {/* Main content mock */}
                <div className="col-span-12 space-y-3 md:col-span-9">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { label: "Alignment", value: "87%", color: "text-primary" },
                      { label: "Streak", value: "23 days", color: "text-secondary" },
                      { label: "Activities", value: "10", color: "text-chart-3" },
                      { label: "Logged", value: "847", color: "text-chart-4" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg bg-background/50 p-3">
                        <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Chart mock */}
                  <div className="rounded-lg bg-background/50 p-4">
                    <div className="mb-3 text-xs font-medium">Weekly Alignment</div>
                    <div className="flex h-24 items-end gap-1.5">
                      {[72, 85, 68, 91, 78, 94, 87].map((v, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${v}%` }}
                          transition={{ duration: 0.5, delay: 0.8 + i * 0.08 }}
                          className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/40 to-primary/80"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow below */}
          <div className="absolute -bottom-10 left-1/2 h-20 w-3/4 -translate-x-1/2 bg-primary/10 blur-[60px]" />
        </motion.div>
      </div>
    </section>
  );
}
