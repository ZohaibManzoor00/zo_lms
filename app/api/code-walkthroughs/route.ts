import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Retrieve all code walkthroughs or filter by course/chapter/lesson
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const chapterId = searchParams.get("chapterId");
    const lessonId = searchParams.get("lessonId");

    const where: any = {};

    if (courseId) where.courseId = courseId;
    if (chapterId) where.chapterId = chapterId;
    if (lessonId) where.lessonId = lessonId;

    const walkthroughs = await prisma.codeWalkthrough.findMany({
      where,
      include: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ walkthroughs });
  } catch (error) {
    console.error("Error retrieving code walkthroughs:", error);
    return NextResponse.json(
      { error: "Failed to retrieve code walkthroughs" },
      { status: 500 }
    );
  }
}

// POST - Save a new code walkthrough
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session, metadata } = body;

    if (!session || !metadata) {
      return NextResponse.json(
        { error: "Missing session or metadata" },
        { status: 400 }
      );
    }

    // Convert session data to database format
    const walkthroughData: any = {
      title: metadata.title,
      description: metadata.description,
      courseId: metadata.courseId,
      chapterId: metadata.chapterId,
      lessonId: metadata.lessonId,
      instructorId: metadata.instructorId,
      startTime: new Date(session.startTime),
      endTime: new Date(session.endTime),
      duration: session.endTime - session.startTime,
      initialCode: session.initialCode,
      finalCode: session.finalCode,
      codeEventCount: session.codeEvents.length,
      audioEventCount: session.audioEvents.length,
      // Audio metadata (already uploaded to Tigris)
      audioFileKey: metadata.audioFileKey || null,
      audioContentType: metadata.audioContentType || null,
      audioSize: metadata.audioSize || null,
    };

    // Create the walkthrough with events
    const walkthrough = await prisma.codeWalkthrough.create({
      data: {
        ...walkthroughData,
        codeEvents: {
          create: session.codeEvents.map((event: any) => ({
            timestamp: new Date(event.timestamp),
            type: event.type,
            data: event.data,
          })),
        },
        audioEvents: {
          create: session.audioEvents.map((event: any) => ({
            timestamp: new Date(event.timestamp),
            type: event.type,
          })),
        },
      },
      include: {
        codeEvents: true,
        audioEvents: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      walkthroughId: walkthrough.id,
      message: "Code walkthrough created successfully",
    });
  } catch (error) {
    console.error("Error saving code walkthrough:", error);
    return NextResponse.json(
      { error: "Failed to save code walkthrough" },
      { status: 500 }
    );
  }
}
