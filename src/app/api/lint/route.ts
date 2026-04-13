import { NextResponse } from "next/server";
import { lint } from "@/lib/lint";
import { getErrorMessage } from "@/lib/errors";

export async function POST() {
  try {
    const result = await lint();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Lint error:", error);
    return NextResponse.json(
      {
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
