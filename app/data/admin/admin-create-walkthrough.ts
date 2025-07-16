import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { s3 } from "@/lib/s3-client";
import { env } from "@/lib/env";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { z } from "zod";

const stepSchema = z.object({
  code: z.string(),
  timestamp: z.number(),
});

const createWalkthroughSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  steps: z.array(stepSchema).min(1),
  audioBuffer: z.instanceof(Buffer),
  audioMimeType: z.string().min(1),
  audioFileName: z.string().min(1),
});

export async function adminCreateWalkthrough(
  input: z.infer<typeof createWalkthroughSchema>
) {
  await requireAdmin();
  const {
    name,
    description,
    steps,
    audioBuffer,
    audioMimeType,
    audioFileName,
  } = createWalkthroughSchema.parse(input);

  const audioKey = `walkthrough-audio/${uuid()}-${audioFileName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: audioKey,
      Body: audioBuffer,
      ContentType: audioMimeType,
    })
  );

  const walkthrough = await prisma.codeWalkthrough.create({
    data: {
      name,
      description,
      audioKey,
      steps: {
        create: steps.map((step, i) => ({
          code: step.code,
          timestamp: step.timestamp,
          stepIndex: i,
        })),
      },
    },
    select: { id: true, audioKey: true },
  });

  return walkthrough;
}
