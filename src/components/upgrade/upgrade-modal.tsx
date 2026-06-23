"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Crown, Zap, Loader2 } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useState } from "react";

export function UpgradeModal() {
  const { showUpgradeModal, setShowUpgradeModal } = useApp();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleUpgrade = () => {
    const productId = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID;

    if (!productId) {
      console.error("NEXT_PUBLIC_POLAR_PRODUCT_ID is not set");
      return;
    }

    setIsRedirecting(true);
    // Redirect to our checkout API route, which creates a Polar checkout session
    window.location.href = `/api/checkout?products=${productId}`;
  };

  return (
    <AnimatePresence>
      {showUpgradeModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => !isRedirecting && setShowUpgradeModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="glass-card relative w-full max-w-lg rounded-2xl p-8">
              <button
                onClick={() => setShowUpgradeModal(false)}
                disabled={isRedirecting}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-card hover:text-foreground disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                  <Crown className="h-7 w-7 text-secondary" />
                </div>
                <h2 className="mb-2 text-2xl font-bold">Upgrade to Pro</h2>
                <p className="text-sm text-muted-foreground">
                  Unlock the full power of Accord and take your routine to the next level.
                </p>
              </div>

              <div className="mb-6 rounded-xl bg-card/50 p-4">
                <div className="mb-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$6</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2.5">
                  {[
                    "Unlimited activities",
                    "90-day history & trends",
                    "AI-powered insights",
                    "Advanced analytics",
                    "Activity heatmap",
                    "Weekly reports",
                    "Data export (JSON/CSV)",
                    "Priority support",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleUpgrade}
                disabled={isRedirecting}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-70"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting to checkout...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Upgrade Now
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Secure checkout powered by Polar • Cancel anytime
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
