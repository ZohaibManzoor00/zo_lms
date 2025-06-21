import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// GET - Retrieve a specific session by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const dataDir = path.join(process.cwd(), "data", "sessions");
    const sessionFile = path.join(dataDir, `${id}.json`);

    if (!existsSync(sessionFile)) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const data = await readFile(sessionFile, "utf-8");
    const session = JSON.parse(data);

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error retrieving session:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
} 