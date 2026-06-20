"use client";

import Link from "next/link";
import { Activity, Globe, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-4.5 w-4.5 text-primary" />
              </div>
              <span className="text-lg font-semibold">Accord</span>
            </Link>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Design your ideal day. Track how closely you live it.
            </p>
            <div className="flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-card hover:text-primary">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-card hover:text-primary">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Product</h4>
            <ul className="space-y-2.5">
              {["Features", "Pricing", "Changelog", "Roadmap"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Company</h4>
            <ul className="space-y-2.5">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 Accord. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with care for better routines.
          </p>
        </div>
      </div>
    </footer>
  );
}
