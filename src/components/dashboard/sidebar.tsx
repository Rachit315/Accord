"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  CalendarClock,
  ClipboardList,
  BarChart3,
  Sparkles,
  Settings,
  Crown,
  Menu,
  X,
  HelpCircle,
} from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";

const navItems = [
  { href: "/dashboard/schedule", icon: CalendarClock, label: "Schedule" },
  { href: "/dashboard/daily-entry", icon: ClipboardList, label: "Daily Entry" },
  { href: "/dashboard/progress", icon: BarChart3, label: "Progress" },
  { href: "/dashboard/insights", icon: Sparkles, label: "Insights" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, setShowUpgradeModal, resetOnboarding } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderSidebarContent = (isMobile: boolean) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Activity className="h-4 w-4 text-primary" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Accord</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId={`sidebar-active-${isMobile ? "mobile" : "desktop"}`}
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <item.icon className="relative z-10 h-4.5 w-4.5" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade card */}
      {user.plan === "free" && (
        <div className="mx-3 mb-4">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-4 text-left transition-all hover:from-primary/15 hover:to-secondary/15"
          >
            <div className="mb-1 flex items-center gap-2">
              <Crown className="h-4 w-4 text-secondary" />
              <span className="text-sm font-semibold">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Unlock unlimited activities & insights
            </p>
          </button>
        </div>
      )}

      {/* Help / Restart Tutorial */}
      <div className="mx-3 mb-4">
        <button
          onClick={() => {
            resetOnboarding();
            setMobileOpen(false);
          }}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Restart Tutorial</span>
        </button>
      </div>

      {/* User */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium">{user.name}</div>
            <div className="truncate text-xs text-muted-foreground">{user.plan === "pro" ? "Pro Plan" : "Free Plan"}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border lg:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card transform transition-transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {renderSidebarContent(true)}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        {renderSidebarContent(false)}
      </div>
    </>
  );
}
