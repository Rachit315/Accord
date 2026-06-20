"use client";

import { motion, Variants } from "framer-motion";
import {
  CalendarClock,
  ClipboardCheck,
  Target,
  BarChart3,
  LineChart,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: CalendarClock,
    title: "Ideal Schedule",
    description: "Design your perfect daily routine with flexible time blocks and smart scheduling.",
    color: "#67C587",
  },
  {
    icon: ClipboardCheck,
    title: "Daily Logging",
    description: "Log your actual activity times with one tap. Quick, simple, and satisfying.",
    color: "#E89A73",
  },
  {
    icon: Target,
    title: "Alignment Tracking",
    description: "See how closely your real day matches your ideal with precision scoring.",
    color: "#3B82F6",
  },
  {
    icon: BarChart3,
    title: "Weekly Insights",
    description: "AI-powered insights identify patterns and suggest improvements to your routine.",
    color: "#8B5CF6",
  },
  {
    icon: LineChart,
    title: "Progress Analytics",
    description: "Track your consistency over time with beautiful charts and detailed reports.",
    color: "#06B6D4",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Context-aware reminders that help you stay on track without feeling intrusive.",
    color: "#F59E0B",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function Features() {
  return (
    <section id="features" className="relative py-32">
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient opacity-50" />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to{" "}
            <span className="gradient-text">align your days</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Powerful tools designed to help you build and maintain your ideal routine.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="glass-card glass-card-hover group cursor-default rounded-2xl p-6"
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <feature.icon className="h-5 w-5" style={{ color: feature.color }} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
