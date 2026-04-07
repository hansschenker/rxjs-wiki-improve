import { NextResponse } from "next/server";
import { deleteWikiPage } from "@/lib/wiki";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const result = await deleteWikiPage(slug);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    const status = message.startsWith("page not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
