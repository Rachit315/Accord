"use client";

import { motion } from "framer-motion";
import { CalendarPlus, ClipboardList, BarChart3 } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: CalendarPlus,
    title: "Create your ideal schedule",
    description:
      "Define your perfect routine — set ideal times for each activity, add flexibility windows, and customize with icons and colors.",
    color: "#67C587",
    preview: (
      <div className="space-y-2">
        {[
          { time: "6:00 AM", activity: "Wake Up", color: "#F59E0B" },
          { time: "7:00 AM", activity: "Breakfast", color: "#E89A73" },
          { time: "8:00 AM", activity: "Study", color: "#3B82F6" },
          { time: "10:00 AM", activity: "Workout", color: "#EF4444" },
        ].map((item) => (
          <div key={item.activity} className="flex items-center gap-3 rounded-lg bg-background/50 px-3 py-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-muted-foreground">{item.time}</span>
            <span className="text-xs font-medium">{item.activity}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    step: "02",
    icon: ClipboardList,
    title: "Log actual activity times",
    description:
      "Mark activities as done throughout your day. Accord automatically records when you completed each task.",
    color: "#E89A73",
    preview: (
      <div className="space-y-2">
        {[
          { activity: "Wake Up", ideal: "6:00 AM", actual: "6:12 AM", status: "on-time" },
          { activity: "Breakfast", ideal: "7:00 AM", actual: "7:05 AM", status: "on-time" },
          { activity: "Study", ideal: "8:00 AM", actual: "8:43 AM", status: "late" },
        ].map((item) => (
          <div key={item.activity} className="flex items-center justify-between rounded-lg bg-background/50 px-3 py-2">
            <span className="text-xs font-medium">{item.activity}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{item.actual}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  item.status === "on-time"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary/10 text-secondary"
                }`}
              >
                {item.status === "on-time" ? "On Time" : "Late"}
              </span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Measure alignment",
    description:
      "See your alignment score, track streaks, discover insights, and improve your routine consistency over time.",
    color: "#3B82F6",
    preview: (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Alignment Score</span>
          <span className="text-lg font-bold text-primary">87%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-background/50">
          <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-primary/60 to-primary" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Streak", value: "23d" },
            { label: "On Time", value: "82%" },
            { label: "Improved", value: "+18%" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-background/50 p-2 text-center">
              <div className="text-sm font-bold">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple as{" "}
            <span className="gradient-text">1, 2, 3</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Get started in minutes. No complex setup needed.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="absolute -right-4 top-12 hidden h-px w-8 lg:block" style={{ backgroundColor: `${step.color}30` }} />
              )}

              <div className="glass-card rounded-2xl p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                    style={{ backgroundColor: `${step.color}15`, color: step.color }}
                  >
                    {step.step}
                  </div>
                  <step.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {/* Mini preview */}
                <div className="rounded-xl bg-card/50 p-3">{step.preview}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
