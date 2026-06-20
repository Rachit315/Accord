"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md space-y-6 flex flex-col items-center"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-semibold text-foreground">Accord</span>
        </Link>

        <SignIn
          path="/auth/signin"
          routing="path"
          forceRedirectUrl="/dashboard/schedule"
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "shadow-none w-full",
              card: "!bg-[#13131A] border border-[#2A2A35] rounded-2xl shadow-2xl w-full",
              headerTitle: "text-2xl font-bold !text-[#F5F5F7]",
              headerSubtitle: "text-sm !text-[#8E8E9A]",
              socialButtonsBlockButton: "border border-[#2A2A35] !bg-[#1A1A24] !text-[#F5F5F7] hover:!bg-[#2A2A35] rounded-xl h-11 transition-colors",
              socialButtonsBlockButtonText: "text-sm font-medium !text-[#F5F5F7]",
              dividerLine: "!bg-[#2A2A35]",
              dividerText: "text-xs !text-[#8E8E9A]",
              formFieldLabel: "text-sm font-medium !text-[#F5F5F7]",
              formFieldInput: "h-11 rounded-xl !border-[#2A2A35] !bg-[#0A0A0F] text-sm !text-[#F5F5F7] focus:!border-[#67C587]",
              formButtonPrimary: "h-11 rounded-xl !bg-[#67C587] text-sm font-semibold !text-[#0A0A0F] hover:!bg-[#55b376] shadow-lg",
              footerActionLink: "!text-[#67C587] hover:!text-[#55b376] font-medium",
              footerActionText: "!text-[#8E8E9A]",
              footer: "!bg-transparent",
              footerPages: "!bg-transparent",
              identityPreviewText: "!text-[#F5F5F7]",
              identityPreviewEditButtonIcon: "!text-[#67C587]",
              formFieldInputShowPasswordButton: "!text-[#8E8E9A] hover:!text-[#F5F5F7]",
              alertText: "!text-[#F5F5F7]",
              formFieldSuccessText: "!text-[#67C587]",
              formFieldErrorText: "!text-[#ef4444]",
              otpCodeFieldInput: "!border-[#2A2A35] rounded-xl !bg-[#0A0A0F] !text-[#F5F5F7]",
              internal: "!text-[#F5F5F7]",
            },
          }}
        />
      </motion.div>
    </div>
  );
}
