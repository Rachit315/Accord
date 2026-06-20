"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard — onboarding tutorial now shows as an overlay there
    router.replace("/dashboard/schedule");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  );
}
