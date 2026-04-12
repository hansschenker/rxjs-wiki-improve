import { NextResponse } from "next/server";
import { searchWikiContent } from "@/lib/wiki";

/**
 * GET /api/wiki/search?q=search+terms
 *
 * Full-text search across wiki page content.
 * Returns matching pages with snippets showing match context.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();

    if (!q || q.length === 0) {
      return NextResponse.json(
        { error: "q parameter is required" },
        { status: 400 },
      );
    }

    const results = await searchWikiContent(q);
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
