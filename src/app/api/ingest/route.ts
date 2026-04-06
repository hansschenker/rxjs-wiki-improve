import { NextRequest, NextResponse } from "next/server";
import { ingest } from "@/lib/ingest";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { title, content } = body;

    // Validate inputs
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "title is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "content is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    const result = await ingest(title.trim(), content.trim());

    return NextResponse.json(result);
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
