// ---------------------------------------------------------------------------
// Slug generation — single canonical implementation
// ---------------------------------------------------------------------------

/**
 * Convert a title into a URL-safe slug (lowercase, hyphens, no special chars).
 *
 * The `[^a-z0-9]+` regex replaces *runs* of non-alphanumeric characters with a
 * single hyphen, so inputs like `"hello--world"` or `"hello  world"` both
 * produce `"hello-world"` without needing a separate dedup step.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
