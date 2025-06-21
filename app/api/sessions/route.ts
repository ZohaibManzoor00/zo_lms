import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export interface SessionMetadata {
  id: string;
  title: string;
  description: string;
  courseId: string;
  chapterId: string;
  lessonId: string;
  instructorId: string;
  duration: number;
  codeEvents: number;
  audioEvents: number;
  audioSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionData {
  metadata: SessionMetadata;
  session: any; // The actual recording session data
}

// Ensure data directory exists
const ensureDataDir = async () => {
  const dataDir = path.join(process.cwd(), "data", "sessions");
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
  return dataDir;
};

// GET - Retrieve all sessions or filter by course/chapter/lesson
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const chapterId = searchParams.get("chapterId");
    const lessonId = searchParams.get("lessonId");

    const dataDir = await ensureDataDir();
    const sessionsFile = path.join(dataDir, "sessions.json");

    let sessions: SessionMetadata[] = [];
    
    if (existsSync(sessionsFile)) {
      const data = await readFile(sessionsFile, "utf-8");
      sessions = JSON.parse(data);
    }

    // Filter sessions based on query parameters
    if (courseId) {
      sessions = sessions.filter(s => s.courseId === courseId);
    }
    if (chapterId) {
      sessions = sessions.filter(s => s.chapterId === chapterId);
    }
    if (lessonId) {
      sessions = sessions.filter(s => s.lessonId === lessonId);
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error retrieving sessions:", error);
    return NextResponse.json(
      { error: "Failed to retrieve sessions" },
      { status: 500 }
    );
  }
}

// POST - Save a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metadata, session } = body;

    if (!metadata || !session) {
      return NextResponse.json(
        { error: "Missing metadata or session data" },
        { status: 400 }
      );
    }

    const dataDir = await ensureDataDir();
    const sessionsFile = path.join(dataDir, "sessions.json");
    const sessionFile = path.join(dataDir, `${metadata.id}.json`);

    // Load existing sessions
    let sessions: SessionMetadata[] = [];
    if (existsSync(sessionsFile)) {
      const data = await readFile(sessionsFile, "utf-8");
      sessions = JSON.parse(data);
    }

    // Check if session already exists
    const existingIndex = sessions.findIndex(s => s.id === metadata.id);
    if (existingIndex >= 0) {
      // Update existing session
      sessions[existingIndex] = {
        ...metadata,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new session
      sessions.push({
        ...metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Save session metadata
    await writeFile(sessionsFile, JSON.stringify(sessions, null, 2));

    // Save session data
    await writeFile(sessionFile, JSON.stringify(session, null, 2));

    return NextResponse.json({ 
      success: true, 
      sessionId: metadata.id,
      message: existingIndex >= 0 ? "Session updated" : "Session created"
    });
  } catch (error) {
    console.error("Error saving session:", error);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }
} 