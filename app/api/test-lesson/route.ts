import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Fetch recordings/walkthroughs for a specific lesson
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const chapterId = searchParams.get("chapterId");
    const lessonId = searchParams.get("lessonId");

    // Validate required parameters
    if (!courseId || !chapterId || !lessonId) {
      return NextResponse.json(
        { 
          error: "Missing required parameters", 
          required: ["courseId", "chapterId", "lessonId"],
          received: { courseId, chapterId, lessonId }
        },
        { status: 400 }
      );
    }

    // First, verify the course, chapter, and lesson exist
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        chapter: {
          id: chapterId,
          course: {
            id: courseId
          }
        }
      },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        }
      }
    });

    if (!lesson) {
      return NextResponse.json(
        { 
          error: "Lesson not found",
          courseId,
          chapterId,
          lessonId
        },
        { status: 404 }
      );
    }

    // Fetch all code walkthroughs for this lesson
    const walkthroughs = await prisma.codeWalkthrough.findMany({
      where: {
        courseId,
        chapterId,
        lessonId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        codeEvents: {
          select: {
            id: true,
            timestamp: true,
            type: true,
            data: true,
          },
          orderBy: {
            timestamp: "asc",
          },
        },
        audioEvents: {
          select: {
            id: true,
            timestamp: true,
            type: true,
          },
          orderBy: {
            timestamp: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response
    const response = {
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        thumbnailKey: lesson.thumbnailKey,
        videoKey: lesson.videoKey,
        position: lesson.position,
        chapter: lesson.chapter,
      },
      walkthroughs: walkthroughs.map(walkthrough => ({
        id: walkthrough.id,
        title: walkthrough.title,
        description: walkthrough.description,
        instructor: walkthrough.user,
        duration: walkthrough.duration,
        startTime: walkthrough.startTime,
        endTime: walkthrough.endTime,
        initialCode: walkthrough.initialCode,
        finalCode: walkthrough.finalCode,
        audioFileKey: walkthrough.audioFileKey,
        audioContentType: walkthrough.audioContentType,
        audioSize: walkthrough.audioSize,
        codeEventCount: walkthrough.codeEventCount,
        audioEventCount: walkthrough.audioEventCount,
        createdAt: walkthrough.createdAt,
        updatedAt: walkthrough.updatedAt,
        // Include events for playback
        codeEvents: walkthrough.codeEvents,
        audioEvents: walkthrough.audioEvents,
      })),
      summary: {
        totalWalkthroughs: walkthroughs.length,
        totalDuration: walkthroughs.reduce((sum, w) => sum + w.duration, 0),
        averageDuration: walkthroughs.length > 0 
          ? Math.round(walkthroughs.reduce((sum, w) => sum + w.duration, 0) / walkthroughs.length)
          : 0,
        hasAudio: walkthroughs.some(w => w.audioFileKey),
        hasVideo: !!lesson.videoKey,
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching lesson data:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson data" },
      { status: 500 }
    );
  }
} 