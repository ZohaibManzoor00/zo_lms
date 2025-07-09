import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3-client";

import { env } from "@/lib/env";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { requireAdmin } from "@/app/data/admin/require-admin";

const aj = arcjet.withRule(fixedWindow({ mode: "LIVE", window: "1m", max: 5 }));

export const fileUploadSchema = z.object({
  filename: z.string().min(1, { message: "Filename is required" }),
  contentType: z.string().min(1, { message: "Content type is required" }),
  size: z.number().min(1, { message: "Size is required" }),
  isImage: z.boolean(),
});

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  try {
    const decision = await aj.protect(request, {
      fingerprint: session?.user?.id as string,
    });
    if (decision.isDenied()) {
      return NextResponse.json(
        {
          error: "Too many requests, please try again later.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = fileUploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { filename, contentType, size } = validation.data;
    const uniqueFileId = `${uuid()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
      ContentType: contentType,
      ContentLength: size,
      Key: uniqueFileId,
    });

    const sixMinutesInSeconds = 360;
    const presignedUrl = await getSignedUrl(s3, command, {
      expiresIn: sixMinutesInSeconds,
    });

    const response = {
      presignedUrl,
      key: uniqueFileId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Failed to generate presigned URL",
      },
      { status: 500 }
    );
  }
}
