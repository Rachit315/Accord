"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  X,
  CalendarClock,
  ClipboardList,
  BarChart3,
  Sparkles,
  Target,
} from "lucide-react";
import { useApp } from "@/contexts/app-context";

const tutorialSteps = [
  {
    icon: CalendarClock,
    title: "Design Your Ideal Schedule",
    subtitle: "Step 1 of 5",
    description:
      "Start by adding your daily activities — wake up, study, workout, meals — and set the ideal time you want to do each one. Add a flexibility window (like ±15 min) so your routine bends without breaking.",
    illustration: (
      <div className="space-y-2.5">
        {[
          { time: "6:00 AM", activity: "Wake Up", icon: "☀️", flex: "±15 min" },
          { time: "7:00 AM", activity: "Workout", icon: "💪", flex: "±30 min" },
          { time: "8:30 AM", activity: "Study", icon: "📚", flex: "±15 min" },
        ].map((item, i) => (
          <motion.div
            key={item.activity}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 * i }}
            className="flex items-center gap-3 rounded-xl bg-background/50 border border-border/30 px-4 py-3"
          >
            <span className="text-lg">{item.icon}</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">{item.activity}</div>
              <div className="text-xs text-muted-foreground">{item.time}</div>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
              {item.flex}
            </span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    icon: ClipboardList,
    title: "Log Your Daily Entries",
    subtitle: "Step 2 of 5",
    description:
      "Each day, simply mark activities as done when you complete them. Accord records the actual time and calculates how closely you matched your ideal schedule.",
    illustration: (
      <div className="space-y-3">
        <div className="rounded-xl border border-border/30 bg-background/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">☀️</span>
              <span className="text-sm font-medium text-foreground">Wake Up</span>
            </div>
            <span className="text-xs text-muted-foreground">Target: 6:00 AM</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-card/60 p-2 border border-border/20">
              <div className="text-[10px] text-muted-foreground font-medium">ACTUAL</div>
              <div className="text-sm font-bold text-foreground">6:12 AM</div>
            </div>
            <div className="rounded-lg bg-card/60 p-2 border border-border/20">
              <div className="text-[10px] text-muted-foreground font-medium">DEVIATION</div>
              <div className="text-sm font-bold text-primary">+12 min</div>
            </div>
            <div className="rounded-lg bg-card/60 p-2 border border-border/20">
              <div className="text-[10px] text-muted-foreground font-medium">SCORE</div>
              <div className="text-sm font-bold text-emerald-400">100%</div>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground text-center">
          +12 min is within the ±15 min flexibility — perfect alignment!
        </p>
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    subtitle: "Step 3 of 5",
    description:
      "Watch your alignment scores improve over time. Build streaks, track weekly trends, and see how consistent you're becoming day by day.",
    illustration: (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Alignment", value: "87%", color: "text-primary" },
            { label: "Streak", value: "0 days", color: "text-secondary" },
            { label: "Improved", value: "—", color: "text-chart-3" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-background/50 border border-border/30 p-3 text-center">
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-background/50 border border-border/30 p-3">
          <div className="text-xs font-medium text-foreground mb-2">Weekly Alignment</div>
          <div className="flex items-end gap-1.5 h-16">
            {[40, 55, 45, 70, 60, 80, 75].map((v, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${v}%` }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-primary/70"
              />
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Sparkles,
    title: "Get Smart Insights",
    subtitle: "Step 4 of 5",
    description:
      "After a few days of logging, Accord analyzes your patterns. Discover your most consistent activities, your trouble spots, and actionable tips to improve.",
    illustration: (
      <div className="space-y-2.5">
        {[
          { icon: "✅", text: "Wake Up is your most consistent activity — keep it up!", type: "strength" },
          { icon: "📈", text: "Your mornings are 23% more aligned than afternoons", type: "trend" },
          { icon: "⚡", text: "Try scheduling workouts before 10 AM for better consistency", type: "tip" },
        ].map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 * i }}
            className="flex items-start gap-3 rounded-xl bg-background/50 border border-border/30 p-3"
          >
            <span className="text-base mt-0.5">{insight.icon}</span>
            <span className="text-xs text-muted-foreground leading-relaxed">{insight.text}</span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    icon: Target,
    title: "You're All Set!",
    subtitle: "Step 5 of 5",
    description:
      "Head to the Schedule tab to add your first activities. Start logging daily and watch your alignment grow. Remember: consistency beats perfection!",
    illustration: (
      <div className="text-center space-y-4 py-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20"
        >
          <span className="text-4xl">🎯</span>
        </motion.div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Ready to design your ideal day?</p>
          <p className="text-xs text-muted-foreground">Your dashboard is waiting. Let&apos;s build some habits!</p>
        </div>
        <div className="flex justify-center gap-6 pt-2">
          {[
            { label: "Add Activities", icon: "📋" },
            { label: "Log Daily", icon: "✍️" },
            { label: "See Results", icon: "📊" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1.5">
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] text-muted-foreground font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function OnboardingOverlay() {
  const { hasCompletedOnboarding, completeOnboarding } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  if (hasCompletedOnboarding) return null;

  const step = tutorialSteps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        <div className="glass-card rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {tutorialSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-400 ${
                    i <= currentStep ? "w-8 bg-primary" : "w-4 bg-border/50"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Skip
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                {/* Icon + Title */}
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <StepIcon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{step.title}</h2>
                    <p className="text-[11px] text-muted-foreground font-medium">{step.subtitle}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-5">
                  {step.description}
                </p>

                {/* Illustration */}
                <div className="rounded-xl bg-card/30 border border-border/20 p-4">
                  {step.illustration}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer / Navigation */}
          <div className="flex items-center justify-between px-6 pb-5">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card/30 px-4 text-sm font-medium transition-colors hover:bg-card disabled:opacity-0 disabled:pointer-events-none"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <button
              onClick={handleNext}
              className="group inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
            >
              {currentStep === tutorialSteps.length - 1 ? "Get Started!" : "Next"}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
