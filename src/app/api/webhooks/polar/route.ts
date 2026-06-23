import { NextRequest, NextResponse } from "next/server";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("POLAR_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: ReturnType<typeof validateEvent>;

  try {
    event = validateEvent(
      body,
      Object.fromEntries(req.headers.entries()),
      webhookSecret
    );
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      console.error("Webhook signature verification failed:", error.message);
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 403 }
      );
    }
    console.error("Webhook validation error:", error);
    return NextResponse.json(
      { error: "Webhook validation failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "order.created": {
        const order = event.data;
        // The customer's email from Polar — we'll use this to find the Clerk user
        const customerEmail = order.customer?.email;

        if (!customerEmail) {
          console.error("No customer email in order:", order.id);
          break;
        }

        // Look up the Clerk user by email
        const client = await clerkClient();
        const users = await client.users.getUserList({
          emailAddress: [customerEmail],
          limit: 1,
        });

        if (users.data.length === 0) {
          console.error("No Clerk user found for email:", customerEmail);
          break;
        }

        const clerkUserId = users.data[0].id;

        // Update the user's plan to "pro" in Clerk metadata
        await client.users.updateUserMetadata(clerkUserId, {
          publicMetadata: {
            plan: "pro",
            polarCustomerId: order.customer?.id,
            polarOrderId: order.id,
            upgradedAt: new Date().toISOString(),
          },
        });

        console.log(
          `✅ User ${clerkUserId} upgraded to Pro (order: ${order.id})`
        );
        break;
      }

      case "subscription.updated": {
        const subscription = event.data;
        const customerEmail = subscription.customer?.email;

        if (!customerEmail) break;

        const client = await clerkClient();
        const users = await client.users.getUserList({
          emailAddress: [customerEmail],
          limit: 1,
        });

        if (users.data.length === 0) break;

        const clerkUserId = users.data[0].id;

        // If the subscription was cancelled or revoked, downgrade to free
        if (
          subscription.status === "canceled" ||
          subscription.status === "revoked"
        ) {
          await client.users.updateUserMetadata(clerkUserId, {
            publicMetadata: {
              plan: "free",
            },
          });
          console.log(`⬇️ User ${clerkUserId} downgraded to Free`);
        }
        break;
      }

      default:
        console.log(`Unhandled Polar event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
