"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  AlertTriangle,
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
import { useApp } from "@/contexts/app-context";
import { useAlarm } from "@/hooks/useAlarm";
import { useNotification } from "@/hooks/useNotification";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
};

const iconEmojis: Record<string, string> = {
  Sunrise: "☀️",
  Brain: "🧠",
  Coffee: "☕",
  BookOpen: "📚",
  Dumbbell: "💪",
  UtensilsCrossed: "🍽️",
  Laptop: "💻",
  ChefHat: "👨‍🍳",
  Footprints: "👣",
  Moon: "🌙",
};

export function AlarmManager() {
  const { activities } = useApp();
  const { isSupported: notifSupported, permission: notifPermission, requestPermission, sendNotification } = useNotification();
  const { isEnabled: alarmEnabled, isPlaying: alarmPlaying, play: playAlarm, stop: stopAlarm, primeAudioContext } = useAlarm();

  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  
  // Track triggered alarms to avoid triggering multiple times in the same minute
  // Key format: YYYY-MM-DD-HH:MM-activityId
  const triggeredAlarms = useRef<Set<string>>(new Set());

  // Show notification permission prompt on mount if supported and not yet requested
  useEffect(() => {
    if (notifSupported && notifPermission === "default") {
      const hasDismissed = localStorage.getItem("accord_alarm_prompt_dismissed");
      if (hasDismissed === "true") return;

      // Small timeout to not disrupt immediately on loading
      const timer = setTimeout(() => {
        setShowPermissionPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifSupported, notifPermission]);

  // Primary background scheduler loop
  useEffect(() => {
    const checkSchedule = () => {
      if (activities.length === 0) return;

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const currentTimeStr = `${hours}:${minutes}`;

      activities.forEach((activity) => {
        // Only run alarms if reminder/alarm is enabled and activity is not archived
        if (!activity.reminderEnabled || activity.archived) return;

        // Check if the current time matches the idealTime
        if (activity.idealTime === currentTimeStr) {
          const alarmKey = `${todayStr}-${currentTimeStr}-${activity.id}`;

          // If not already triggered for this minute, trigger it!
          if (!triggeredAlarms.current.has(alarmKey)) {
            triggeredAlarms.current.add(alarmKey);
            
            // Set the activity to show the alert screen
            setActiveActivity(activity);

            // Play the audio alarm sound (Web Audio API)
            playAlarm();

            // Fire standard browser system notification
            sendNotification(`Time for ${activity.title}!`, {
              body: activity.description || `Your scheduled activity "${activity.title}" is due.`,
              requireInteraction: true,
            });
          }
        }
      });
    };

    // Prime audio context on any click to ensure sound works when alarm triggers
    const handleWindowClick = () => {
      primeAudioContext();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("click", handleWindowClick);
    }

    // Run check every 10 seconds
    const intervalId = setInterval(checkSchedule, 10000);
    
    // Run once immediately
    checkSchedule();

    return () => {
      clearInterval(intervalId);
      if (typeof window !== "undefined") {
        window.removeEventListener("click", handleWindowClick);
      }
    };
  }, [activities, playAlarm, sendNotification, primeAudioContext]);

  // Clean up triggered alarms from previous days to save memory
  useEffect(() => {
    const cleanInterval = setInterval(() => {
      const todayStr = new Date().toISOString().split("T")[0];
      const nextSet = new Set<string>();
      triggeredAlarms.current.forEach((key) => {
        if (key.startsWith(todayStr)) {
          nextSet.add(key);
        }
      });
      triggeredAlarms.current = nextSet;
    }, 3600000); // hourly clean up

    return () => clearInterval(cleanInterval);
  }, []);

  const handleStopAlarm = () => {
    stopAlarm();
    setActiveActivity(null);
  };

  const handleAcceptNotifications = async () => {
    await requestPermission();
    localStorage.setItem("accord_alarm_prompt_dismissed", "true");
    setShowPermissionPrompt(false);
  };

  const handleSkipPrompt = () => {
    localStorage.setItem("accord_alarm_prompt_dismissed", "true");
    setShowPermissionPrompt(false);
  };

  // Icon component lookup helper
  const IconComponent = activeActivity ? iconMap[activeActivity.icon] || Clock : Clock;

  return (
    <>
      {/* 1. Fullscreen Alert Overlay when Alarm is active */}
      <AnimatePresence>
        {activeActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 text-white p-6 select-none"
            style={{
              backgroundImage: `radial-gradient(circle at center, ${activeActivity.color}25 0%, #030303 100%)`,
            }}
          >
            {/* Ambient Pulsing Background Ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                className="w-96 h-96 rounded-full opacity-10 animate-ping" 
                style={{ backgroundColor: activeActivity.color }}
              />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
              {/* Pulsing Emoji/Icon Bubble */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
                className="flex h-24 w-24 items-center justify-center rounded-3xl mb-8 shadow-2xl text-5xl"
                style={{
                  backgroundColor: `${activeActivity.color}20`,
                  border: `2px solid ${activeActivity.color}`,
                  boxShadow: `0 0 40px ${activeActivity.color}40`,
                }}
              >
                {iconEmojis[activeActivity.icon] || "⭐"}
              </motion.div>

              <span className="text-sm font-semibold tracking-wider uppercase mb-2 text-primary opacity-90 flex items-center gap-1.5 justify-center">
                <Sparkles className="h-4 w-4" />
                Routine Due Now
              </span>

              <h1 className="text-4xl font-extrabold tracking-tight mb-3">
                {activeActivity.title}
              </h1>

              {activeActivity.description && (
                <p className="text-muted-foreground text-sm max-w-md mb-8 leading-relaxed">
                  {activeActivity.description}
                </p>
              )}

              {/* Time display */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 mb-12 text-lg font-semibold tracking-tight text-white/80">
                <Clock className="h-4.5 w-4.5 text-primary" />
                Ideal Time: {activeActivity.idealTime}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-4 w-full sm:w-64">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleStopAlarm}
                  className="w-full py-6 rounded-2xl text-base font-bold tracking-tight shadow-xl shadow-destructive/20 active:scale-95 transition-all animate-bounce"
                >
                  <VolumeX className="h-5 w-5 mr-2" />
                  Stop Alarm
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Custom Dialog to Request Notifications Permission */}
      <Dialog open={showPermissionPrompt} onOpenChange={setShowPermissionPrompt}>
        <DialogContent className="sm:max-w-md bg-popover text-popover-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>Enable Schedule Alerts?</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-relaxed text-muted-foreground">
              Would you like to enable system notifications so Accord can alert you when your scheduled activities are due? This allows alarms to ring even if the dashboard is in the background.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={handleSkipPrompt}
              className="flex-1 sm:flex-none"
            >
              Skip
            </Button>
            <Button
              variant="default"
              onClick={handleAcceptNotifications}
              className="flex-1 sm:flex-none shadow-lg shadow-primary/20"
            >
              Enable Alerts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
