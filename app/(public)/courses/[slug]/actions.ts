"use server";

import { requireUser } from "@/app/data/user/require-user";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const aj = arcjet.withRule(fixedWindow({ mode: "LIVE", window: "1m", max: 5 }))

export const enrollInCourse = async (
  courseId: string
): Promise<ApiResponse | never> => {
  const user = await requireUser();
  let checkoutUrl: string;
  try {
    const req = await request()
    const decision = await aj.protect(req, { fingerprint: user.id })
    if (decision.isDenied()) {
      return {
        status: "error",
        message: "Too many requests. You have been blocked for 1 minute",
      };
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
      },
    });

    if (!course) {
      return {
        status: "error",
        message: "Course not found",
      };
    }

    const userWithStripeCustomerId = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    let stripeCustomerId: string;

    if (userWithStripeCustomerId?.stripeCustomerId) {
      stripeCustomerId = userWithStripeCustomerId.stripeCustomerId;
    } else {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });

      stripeCustomerId = stripeCustomer.id;

      console.log(stripeCustomerId, "STRIPE CUSTOMER ID");

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });

      console.log(stripeCustomerId, "STRIPE CUSTOMER ID ADDED TO DB");
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: courseId,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (existingEnrollment?.status === "Active") {
        return {
          status: "success",
          message: "You are already enrolled in this course",
        };
      }

      let enrollment;
      if (existingEnrollment) {
        enrollment = await tx.enrollment.update({
          where: {
            id: existingEnrollment.id,
          },
          data: {
            status: "Pending",
            amount: course.price,
            updatedAt: new Date(),
          },
        });
      } else {
        enrollment = await tx.enrollment.create({
          data: {
            userId: user.id,
            courseId: courseId,
            amount: course.price,
            status: "Pending",
          },
        });
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [{ price: "price_1RizWLQ4Y7NQTfoSxEoBME8m", quantity: 1 }],
        mode: "payment",
        success_url: `${env.BETTER_AUTH_URL}/payment/success`,
        cancel_url: `${env.BETTER_AUTH_URL}/payment/cancel`,
        metadata: {
          userId: user.id,
          courseId: courseId,
          enrollmentId: enrollment.id,
        },
      });

      return {
        enrollmentId: enrollment.id,
        checkoutUrl: checkoutSession.url,
      };
    });

    checkoutUrl = result.checkoutUrl as string;

  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return {
        status: "error",
        message: "Payment system error. Please try again later",
      };
    }
    return {
      status: "error",
      message: "Something went wrong",
    };
  }

  redirect(checkoutUrl);
};
