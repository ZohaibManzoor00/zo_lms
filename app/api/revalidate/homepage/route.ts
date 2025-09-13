import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the secret token from the request
    const secret = request.nextUrl.searchParams.get("secret");

    // Check for secret to confirm this is a valid request
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    // Revalidate homepage data
    revalidateTag("homepage");
    revalidateTag("courses");
    revalidateTag("lessons");

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: "Homepage data revalidated successfully",
    });
  } catch {
    return NextResponse.json(
      { message: "Error revalidating homepage data" },
      { status: 500 }
    );
  }
}
