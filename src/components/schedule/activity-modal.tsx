"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Bell } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { Activity } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { MaterialTimePicker } from "./material-time-picker";

const activityIcons = [
  "Sunrise", "Brain", "Coffee", "BookOpen", "Dumbbell",
  "UtensilsCrossed", "Laptop", "ChefHat", "Footprints", "Moon",
];

const activityColors = [
  "#67C587", "#E89A73", "#F59E0B", "#EF4444", "#3B82F6",
  "#8B5CF6", "#06B6D4", "#F97316", "#A78BFA", "#6366F1",
  "#EC4899", "#14B8A6",
];

const iconEmojis: Record<string, string> = {
  Sunrise: "☀️", Brain: "🧠", Coffee: "☕", BookOpen: "📚", Dumbbell: "💪",
  UtensilsCrossed: "🍽️", Laptop: "💻", ChefHat: "👨‍🍳", Footprints: "👣", Moon: "🌙",
};

interface ActivityModalProps {
  open: boolean;
  onClose: () => void;
  activity: Activity | null;
}

export function ActivityModal({ open, onClose, activity }: ActivityModalProps) {
  const { addActivity, updateActivity, activities } = useApp();
  const isEditing = !!activity;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [idealTime, setIdealTime] = useState("08:00");
  const [flexibility, setFlexibility] = useState(15);
  const [icon, setIcon] = useState("Sunrise");
  const [color, setColor] = useState("#67C587");
  const [reminder, setReminder] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (activity) {
      setTitle(activity.title);
      setDescription(activity.description);
      setIdealTime(activity.idealTime);
      setFlexibility(activity.flexibilityWindow);
      setIcon(activity.icon);
      setColor(activity.color);
      setReminder(activity.reminderEnabled);
    } else {
      setTitle("");
      setDescription("");
      setIdealTime("08:00");
      setFlexibility(15);
      setIcon("Sunrise");
      setColor("#67C587");
      setReminder(true);
    }
  }, [activity, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Check for duplicate activity name (excluding current activity if editing)
    const isDuplicate = activities.some(
      (a) =>
        !a.archived &&
        a.title.toLowerCase().trim() === title.toLowerCase().trim() &&
        (!isEditing || a.id !== activity?.id)
    );

    if (isDuplicate) {
      alert("You cannot make an activity of the same name. Two activities of the same name cannot happen.");
      return;
    }

    if (isEditing && activity) {
      updateActivity(activity.id, {
        title,
        description,
        idealTime,
        flexibilityWindow: flexibility,
        icon,
        color,
        reminderEnabled: reminder,
      });
    } else {
      addActivity({
        title,
        description,
        idealTime,
        flexibilityWindow: flexibility,
        icon,
        color,
        reminderEnabled: reminder,
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="glass-card relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-card hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="mb-6 text-xl font-bold">
                {isEditing ? "Edit Activity" : "New Activity"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Activity Name</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    placeholder="e.g., Morning Run"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    placeholder="Brief description"
                  />
                </div>

                {/* Time and Flexibility */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      <Clock className="mr-1 inline h-3.5 w-3.5" />
                      Ideal Time
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPicker(true)}
                      className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm text-left outline-none transition-colors hover:border-primary/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 flex items-center justify-between text-foreground w-full"
                    >
                      <span>{formatTime(idealTime)}</span>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Flexibility (min)</label>
                    <select
                      value={flexibility}
                      onChange={(e) => setFlexibility(Number(e.target.value))}
                      className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    >
                      {[5, 10, 15, 20, 30, 45, 60].map((v) => (
                        <option key={v} value={v}>±{v} minutes</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Icon Picker */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Icon</label>
                  <div className="grid grid-cols-5 gap-2">
                    {activityIcons.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setIcon(ic)}
                        className={`flex h-11 items-center justify-center rounded-xl border text-lg transition-all ${
                          icon === ic
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border bg-background/50 hover:border-primary/30"
                        }`}
                      >
                        {iconEmojis[ic] || "⭐"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {activityColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`h-8 w-8 rounded-lg transition-all ${
                          color === c ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Alarm */}
                <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Enable Alarm</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReminder(!reminder)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      reminder ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        reminder ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  {isEditing ? "Save Changes" : "Create Activity"}
                </button>
              </form>
            </div>
          </motion.div>
          <MaterialTimePicker
            open={showPicker}
            value={idealTime}
            onChange={(val) => setIdealTime(val)}
            onClose={() => setShowPicker(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
}
