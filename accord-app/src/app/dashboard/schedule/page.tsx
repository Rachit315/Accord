"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  Clock,
  Bell,
  BellOff,
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
  CalendarClock,
} from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { Activity } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { ActivityModal } from "@/components/schedule/activity-modal";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sunrise, Brain, Coffee, BookOpen, Dumbbell, UtensilsCrossed, Laptop, ChefHat, Footprints, Moon,
};

export default function SchedulePage() {
  const { activities, deleteActivity, archiveActivity, reorderActivities } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const activeActivities = activities
    .filter((a) => !a.archived)
    .sort((a, b) => a.order - b.order);

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setModalOpen(true);
    setMenuOpen(null);
  };

  const handleDelete = (id: string) => {
    deleteActivity(id);
    setMenuOpen(null);
  };

  const handleArchive = (id: string) => {
    archiveActivity(id);
    setMenuOpen(null);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;
      const newOrder = [...activeActivities];
      const [moved] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(index, 0, moved);
      reorderActivities(newOrder);
      setDraggedIndex(index);
    },
    [draggedIndex, activeActivities, reorderActivities]
  );

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Schedule</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Design your ideal daily routine
          </p>
        </div>
        <button
          onClick={() => {
            setEditingActivity(null);
            setModalOpen(true);
          }}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Activity</span>
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[23px] top-0 h-full w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />

        <div className="space-y-3">
          <AnimatePresence>
            {activeActivities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/20 py-20 text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CalendarClock className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Your schedule is empty</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Start by adding your daily activities — wake up, study, workout, meals — to design your ideal routine.
                </p>
                <button
                  onClick={() => {
                    setEditingActivity(null);
                    setModalOpen(true);
                  }}
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Activity
                </button>
              </motion.div>
            ) : (
              activeActivities.map((activity, index) => {
                const IconComponent = iconMap[activity.icon] || Clock;
                return (
                  <motion.div
                    key={activity.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`group relative flex items-start gap-4 ${
                      draggedIndex === index ? "opacity-50" : ""
                    }`}
                  >
                    {/* Timeline dot */}
                    <div
                      className="relative z-10 mt-4 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 bg-background"
                      style={{ borderColor: activity.color }}
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: activity.color }}
                      />
                    </div>

                    {/* Card */}
                    <div className="glass-card glass-card-hover flex-1 rounded-xl p-4 cursor-grab active:cursor-grabbing">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${activity.color}15`, color: activity.color }}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{activity.title}</h3>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatTime(activity.idealTime)}
                              </span>
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                ±{activity.flexibilityWindow} min
                              </span>
                              {activity.reminderEnabled ? (
                                <span className="inline-flex items-center gap-1 text-xs text-primary">
                                  <Bell className="h-3 w-3" /> Reminder
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <BellOff className="h-3 w-3" /> No reminder
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Menu */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setMenuOpen(menuOpen === activity.id ? null : activity.id)
                            }
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          <AnimatePresence>
                            {menuOpen === activity.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-border bg-card p-1 shadow-xl"
                              >
                                <button
                                  onClick={() => handleEdit(activity)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                                >
                                  <Pencil className="h-3.5 w-3.5" /> Edit
                                </button>
                                <button
                                  onClick={() => handleArchive(activity.id)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                                >
                                  <Archive className="h-3.5 w-3.5" /> Archive
                                </button>
                                <button
                                  onClick={() => handleDelete(activity.id)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click outside to close menus */}
      {menuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
      )}

      {/* Activity Modal */}
      <ActivityModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingActivity(null);
        }}
        activity={editingActivity}
      />
    </motion.div>
  );
}
