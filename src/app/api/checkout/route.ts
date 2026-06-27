import { Checkout } from "@polar-sh/nextjs";
import type { NextRequest } from "next/server";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const checkoutHandler = process.env.POLAR_ACCESS_TOKEN
  ? Checkout({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      successUrl: `${appUrl}/dashboard/checkout-success?checkout_id={CHECKOUT_ID}&success=true`,
      server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
    })
  : null;

export async function GET(request: NextRequest) {
  if (!checkoutHandler) {
    return Response.json(
      { error: "Polar checkout is not configured." },
      { status: 503 }
    );
  }

  return checkoutHandler(request);
}
