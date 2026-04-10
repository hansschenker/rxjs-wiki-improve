import { NextRequest, NextResponse } from "next/server";
import { readWikiPage, listWikiPages, updateIndex, appendToLog } from "@/lib/wiki";
import { writeWikiPageWithSideEffects, deleteWikiPage } from "@/lib/lifecycle";

/**
 * POST /api/lint/fix — auto-fix a lint issue.
 *
 * Supported issue types:
 * - `missing-crossref`: appends a cross-reference link to the source page.
 * - `orphan-page`: adds the page to the wiki index.
 * - `stale-index`: removes a stale entry from the wiki index.
 * - `empty-page`: deletes an empty page entirely.
 *
 * Request body:
 * ```json
 * { "type": "missing-crossref", "slug": "source-page", "targetSlug": "target-page" }
 * { "type": "orphan-page", "slug": "page-slug" }
 * { "type": "stale-index", "slug": "page-slug" }
 * { "type": "empty-page", "slug": "page-slug" }
 * ```
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, slug } = body;

    // -----------------------------------------------------------------------
    // orphan-page — add the page to the index
    // -----------------------------------------------------------------------
    if (type === "orphan-page") {
      if (!slug) {
        return NextResponse.json(
          { error: "Missing required field: slug" },
          { status: 400 },
        );
      }

      const page = await readWikiPage(slug);
      if (!page) {
        return NextResponse.json(
          { error: `Page not found: ${slug}` },
          { status: 404 },
        );
      }

      // Extract summary from the first paragraph
      const summaryMatch = page.content.match(/^#\s+.+\n+(.+)/m);
      const summary = summaryMatch ? summaryMatch[1].slice(0, 120) : slug;

      await writeWikiPageWithSideEffects({
        slug,
        title: page.title,
        content: page.content,
        summary,
        logOp: "edit",
        logDetails: () => "auto-fix: added orphan page to index",
        crossRefSource: null,
      });

      return NextResponse.json({
        success: true,
        slug,
        message: `Added ${slug} to index`,
      });
    }

    // -----------------------------------------------------------------------
    // stale-index — remove a stale entry from the index
    // -----------------------------------------------------------------------
    if (type === "stale-index") {
      if (!slug) {
        return NextResponse.json(
          { error: "Missing required field: slug" },
          { status: 400 },
        );
      }

      const entries = await listWikiPages();
      const filtered = entries.filter((e) => e.slug !== slug);

      if (filtered.length === entries.length) {
        return NextResponse.json({
          success: true,
          slug,
          message: `Entry for ${slug} not found in index — no changes needed`,
        });
      }

      await updateIndex(filtered);
      await appendToLog(
        "edit",
        slug,
        `auto-fix: removed stale index entry for ${slug}`,
      );

      return NextResponse.json({
        success: true,
        slug,
        message: `Removed stale entry for ${slug} from index`,
      });
    }

    // -----------------------------------------------------------------------
    // empty-page — delete an empty page
    // -----------------------------------------------------------------------
    if (type === "empty-page") {
      if (!slug) {
        return NextResponse.json(
          { error: "Missing required field: slug" },
          { status: 400 },
        );
      }

      await deleteWikiPage(slug);

      return NextResponse.json({
        success: true,
        slug,
        message: `Deleted empty page ${slug}`,
      });
    }

    // -----------------------------------------------------------------------
    // missing-crossref — add a cross-reference link
    // -----------------------------------------------------------------------
    if (type === "missing-crossref") {
      const { targetSlug } = body;

      if (!slug || !targetSlug) {
        return NextResponse.json(
          { error: "Missing required fields: slug and targetSlug" },
          { status: 400 },
        );
      }

      // Read the source page
      const sourcePage = await readWikiPage(slug);
      if (!sourcePage) {
        return NextResponse.json(
          { error: `Source page not found: ${slug}` },
          { status: 404 },
        );
      }

      // Read the target page to get its title
      const targetPage = await readWikiPage(targetSlug);
      if (!targetPage) {
        return NextResponse.json(
          { error: `Target page not found: ${targetSlug}` },
          { status: 404 },
        );
      }

      // Build the cross-reference link
      const link = `[${targetPage.title}](${targetSlug}.md)`;

      // Check if the link already exists (avoid duplicates)
      if (sourcePage.content.includes(`(${targetSlug}.md)`)) {
        return NextResponse.json({
          success: true,
          slug,
          message: `Page already links to ${targetSlug}.md — no changes needed`,
        });
      }

      // Append the link to a ## Related section
      let updatedContent: string;
      const relatedHeadingRe = /^## Related\b.*$/m;
      const relatedMatch = relatedHeadingRe.exec(sourcePage.content);

      if (relatedMatch) {
        // Insert the link on the line after the heading.
        // Find the end of the Related section: either the next heading or EOF.
        const afterHeading = relatedMatch.index! + relatedMatch[0].length;
        const restAfterHeading = sourcePage.content.slice(afterHeading);

        // Find next heading (## or #) after the Related section
        const nextHeadingMatch = restAfterHeading.match(/\n(?=## )/);
        const insertPos = nextHeadingMatch
          ? afterHeading + nextHeadingMatch.index!
          : sourcePage.content.length;

        // Insert just before the next heading (or at EOF), with a blank line guard
        const before = sourcePage.content.slice(0, insertPos).trimEnd();
        const after = sourcePage.content.slice(insertPos);
        updatedContent = `${before}\n- ${link}${after ? `\n${after}` : "\n"}`;
      } else {
        // No Related section yet — append one at the end
        updatedContent = `${sourcePage.content.trimEnd()}\n\n## Related\n\n- ${link}\n`;
      }

      // Extract summary from the source page for the index entry
      const summaryMatch = sourcePage.content.match(
        /^#\s+.+\n+(.+)/m,
      );
      const summary = summaryMatch
        ? summaryMatch[1].slice(0, 120)
        : slug;

      // Write via the lifecycle pipeline (handles index, log, embeddings)
      await writeWikiPageWithSideEffects({
        slug,
        title: sourcePage.title,
        content: updatedContent,
        summary,
        logOp: "edit",
        logDetails: () => `auto-fix: added cross-reference to ${targetSlug}.md`,
        crossRefSource: null, // skip cross-ref discovery — we're adding a specific link
      });

      return NextResponse.json({
        success: true,
        slug,
        message: `Added cross-reference from ${slug}.md to ${targetSlug}.md`,
      });
    }

    // -----------------------------------------------------------------------
    // Unsupported type
    // -----------------------------------------------------------------------
    return NextResponse.json(
      { error: "Auto-fix not supported for this issue type" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Lint fix error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
