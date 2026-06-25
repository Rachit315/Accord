"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { verifyCheckoutAction } from "@/app/actions";
import { useApp } from "@/contexts/app-context";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";
  const checkoutId = searchParams.get("checkout_id");
  const [countdown, setCountdown] = useState(5);
  const [isVerifying, setIsVerifying] = useState(!!checkoutId);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationDone, setVerificationDone] = useState(!checkoutId);
  const { refreshUser } = useApp();

  // Step 1: Verify the checkout with Polar
  useEffect(() => {
    if (!isSuccess) {
      router.replace("/dashboard/settings");
      return;
    }

    async function verify() {
      if (checkoutId) {
        setIsVerifying(true);
        const result = await verifyCheckoutAction(checkoutId);
        if (result.success) {
          // Force-reload Clerk user to pick up plan:"pro" from server metadata
          await refreshUser();
        } else {
          console.error("Verification failed:", result.error || result.status);
          setVerificationError(result.error || `Checkout status is ${result.status}`);
        }
        setIsVerifying(false);
        setVerificationDone(true);
      }
    }

    verify();
  }, [isSuccess, checkoutId, router, refreshUser]);

  // Step 2: Only start countdown AFTER verification completes
  useEffect(() => {
    if (!verificationDone || !isSuccess) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard/settings");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [verificationDone, isSuccess, router]);

  if (!isSuccess) return null;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
        className="glass-card relative w-full max-w-md rounded-2xl p-8 text-center"
      >
        {/* Animated sparkles */}
        {!isVerifying && !verificationError && (
          <motion.div
            initial={{ opacity: 0, rotate: -20 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="absolute -top-3 -right-3"
          >
            <Sparkles className="h-8 w-8 text-secondary" />
          </motion.div>
        )}

        {/* Success / Loader icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20"
        >
          {isVerifying ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          ) : verificationError ? (
            <AlertCircle className="h-10 w-10 text-destructive" />
          ) : (
            <CheckCircle className="h-10 w-10 text-green-500" />
          )}
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isVerifying ? (
            <>
              <h1 className="mb-2 text-2xl font-bold">Verifying Payment...</h1>
              <p className="mb-6 text-sm text-muted-foreground">
                Please wait while we confirm your checkout session with Polar.
              </p>
            </>
          ) : verificationError ? (
            <>
              <h1 className="mb-2 text-2xl font-bold text-destructive">Verification Issue</h1>
              <p className="mb-2 text-muted-foreground">
                We couldn't verify your payment automatically, but it might still be processing.
              </p>
              <p className="mb-6 text-xs text-muted-foreground/80">
                Detail: {verificationError}
              </p>
            </>
          ) : (
            <>
              <h1 className="mb-2 text-2xl font-bold">Payment Successful! 🎉</h1>
              <p className="mb-2 text-muted-foreground">
                Welcome to <span className="font-semibold text-primary">Accord Pro</span>!
              </p>
              <p className="mb-6 text-sm text-muted-foreground">
                You now have unlimited activities, 90-day history, AI insights, and more.
              </p>
            </>
          )}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => router.push("/dashboard/settings")}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </motion.button>

        <p className="mt-3 text-xs text-muted-foreground">
          Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
        </p>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
