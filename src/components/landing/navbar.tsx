"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { UserButton, Show, useAuth } from "@clerk/nextjs";

export function Navbar() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        router.push("/dashboard/schedule");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSignedIn, router]);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-4.5 w-4.5 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Accord</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <Link
              href="/auth/signin"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              Start Free
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/dashboard/schedule"
              className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              <span>Dashboard</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center rounded border border-border bg-[#1A1A24] px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                D
              </kbd>
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </Show>
        </div>
      </div>
    </motion.nav>
  );
}


