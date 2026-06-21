"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { UpgradeModal } from "@/components/upgrade/upgrade-modal";
import { OnboardingOverlay } from "@/components/dashboard/onboarding-overlay";
import { AlarmManager } from "@/components/dashboard/alarm-manager";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">
          {children}
        </div>
      </main>
      <UpgradeModal />
      <OnboardingOverlay />
      <AlarmManager />
    </div>
  );
}
