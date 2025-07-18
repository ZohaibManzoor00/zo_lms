import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";

export const POST = async (req: Request) => {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
      console.log("Webhook event constructed successfully:", event.type);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return new Response("Webhook signature verification failed", {
        status: 400,
      });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
      try {
        const courseId = session.metadata?.courseId;
        const enrollmentId = session.metadata?.enrollmentId;
        const customerId = session.customer as string;

        console.log("Session metadata:", {
          courseId,
          enrollmentId,
          customerId,
          amount: session.amount_total,
        });

        if (!courseId) {
          console.error("Missing courseId in session metadata");
          return new Response("Missing courseId in session metadata", {
            status: 400,
          });
        }

        if (!enrollmentId) {
          console.error("Missing enrollmentId in session metadata");
          return new Response("Missing enrollmentId in session metadata", {
            status: 400,
          });
        }

        if (!customerId) {
          console.error("Missing customer in session");
          return new Response("Missing customer in session", { status: 400 });
        }

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.error("User not found for stripeCustomerId:", customerId);
          return new Response("User not found", { status: 404 });
        }

        console.log("User found:", user.id);

        // Update enrollment
        const updatedEnrollment = await prisma.enrollment.update({
          where: { id: enrollmentId },
          data: {
            userId: user.id,
            courseId: courseId,
            amount: session.amount_total || 0,
            status: "Active",
          },
        });

        console.log("Enrollment updated successfully:", updatedEnrollment.id);
      } catch (dbError) {
        console.error("Database error in webhook:", dbError);
        return new Response("Database error", { status: 500 });
      }
    } else {
      console.log("Unhandled event type:", event.type);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
};
