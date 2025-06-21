import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Retrieve a specific code walkthrough by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const walkthrough = await prisma.codeWalkthrough.findUnique({
      where: { id },
      include: {
        codeEvents: {
          orderBy: {
            timestamp: "asc",
          },
        },
        audioEvents: {
          orderBy: {
            timestamp: "asc",
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            chapter: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!walkthrough) {
      return NextResponse.json(
        { error: "Code walkthrough not found" },
        { status: 404 }
      );
    }

    // Convert database format back to session format for compatibility
    const session = {
      id: walkthrough.id,
      startTime: walkthrough.startTime.getTime(),
      endTime: walkthrough.endTime.getTime(),
      codeEvents: walkthrough.codeEvents.map((event) => ({
        timestamp: event.timestamp.getTime(),
        type: event.type,
        data: event.data,
      })),
      audioEvents: walkthrough.audioEvents.map((event) => ({
        timestamp: event.timestamp.getTime(),
        type: event.type,
      })),
      initialCode: walkthrough.initialCode,
      finalCode: walkthrough.finalCode,
      audioUrl: walkthrough.audioFileKey
        ? `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.fly.storage.tigris.dev/${walkthrough.audioFileKey}`
        : undefined,
    };

    return NextResponse.json({
      walkthrough: {
        ...walkthrough,
        session,
      },
    });
  } catch (error) {
    console.error("Error retrieving code walkthrough:", error);
    return NextResponse.json(
      { error: "Failed to retrieve code walkthrough" },
      { status: 500 }
    );
  }
}
