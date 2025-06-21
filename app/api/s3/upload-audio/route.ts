import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3-client";
import { env } from "@/lib/env";
import { v4 as uuid } from "uuid";
import { z } from "zod";

const audioUploadSchema = z.object({
  filename: z.string().min(1, { message: "Filename is required" }),
  contentType: z.string().min(1, { message: "Content type is required" }),
  size: z.number().min(1, { message: "Size is required" }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = audioUploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { filename, contentType, size } = validation.data;
    const uniqueFileId = `audio/${uuid()}-${filename}`;

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
    console.error("Error generating audio presigned URL:", error);
    return NextResponse.json(
      {
        error: "Failed to generate presigned URL",
      },
      { status: 500 }
    );
  }
}
