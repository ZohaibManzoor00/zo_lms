import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { s3 } from "@/lib/s3-client";
import { env } from "@/lib/env";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const codeEventSchema = z.object({
  timestamp: z.number(),
  type: z.enum(["keypress", "delete", "paste"]),
  data: z.string(),
  position: z.number().optional(),
});

const saveTestRecordingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  language: z.string().optional(),
  audioBase64: z.string().min(1, "Audio data is required"),
  audioMimeType: z.string().min(1, "Audio MIME type is required"),
  duration: z.number().positive("Duration must be positive"),
  codeEvents: z
    .array(codeEventSchema)
    .min(1, "At least one code event is required"),
  initialCode: z.string(),
  finalCode: z.string(),
});

export async function adminSaveTestRecording(
  input: z.infer<typeof saveTestRecordingSchema>
) {
  await requireAdmin();

  const { name, description, audioBase64, audioMimeType, codeEvents } =
    saveTestRecordingSchema.parse(input);

  // Generate unique filename
  const audioKey = `walkthrough-audio/${uuid()}-${name.replace(
    /[^a-zA-Z0-9]/g,
    "_"
  )}.webm`;

  // Upload audio to S3
  const audioBuffer = Buffer.from(audioBase64, "base64");
  await s3.send(
    new PutObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: audioKey,
      Body: audioBuffer,
      ContentType: audioMimeType,
    })
  );

  // Convert code events to walkthrough steps
  const steps = codeEvents.map((event, index) => ({
    code: event.data,
    timestamp: event.timestamp / 1000, // Convert milliseconds to seconds
    stepIndex: index,
  }));

  // Create walkthrough in database
  const walkthrough = await prisma.codeWalkthrough.create({
    data: {
      name,
      description,
      audioKey,
      steps: {
        create: steps,
      },
    },
    select: {
      id: true,
      name: true,
      audioKey: true,
      createdAt: true,
    },
  });

  revalidatePath("/admin/code-walkthrough");

  return walkthrough;
}

export type AdminSaveTestRecordingType = Awaited<
  ReturnType<typeof adminSaveTestRecording>
>;
