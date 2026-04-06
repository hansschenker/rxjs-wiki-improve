Title: Fix slug dedup on re-ingest and fragile summary extraction
Files: src/lib/ingest.ts, src/lib/__tests__/ingest.test.ts
Issue: none

## What

Fix two bugs in the ingest pipeline:

1. **Slug collision**: Re-ingesting with the same title appends a duplicate index entry because the dedup check uses `listWikiPages()` which reads from `index.md`, but the check `!entries.some(e => e.slug === slug)` won't catch it if the entry already exists — actually looking at the code again, it DOES check. But the real issue is: if the entry already exists, the summary and title don't get updated. The old entry stays with the old summary even though the content has been re-ingested. Fix: when re-ingesting, update the existing entry's summary/title instead of skipping.

2. **Summary extraction is fragile**: `content.split(/[.\n]/)[0]` splits on the first period OR newline, which produces bad summaries for content starting with abbreviations like "Dr. Smith" → summary = "Dr". Fix: use the first sentence more intelligently — split on `. ` (period followed by space) or `\n\n` (paragraph break) instead of bare `.` or `\n`.

## Steps

1. **Fix summary extraction in `src/lib/ingest.ts`**:
   - Replace `content.split(/[.\n]/)[0]` with a smarter first-sentence extractor
   - Use regex like `/[.!?]\s/` to find sentence boundaries, or split on `\n\n` for paragraph break
   - Take the first sentence up to 200 chars

2. **Fix re-ingest dedup in `src/lib/ingest.ts`**:
   - When slug already exists in entries, update that entry's title and summary instead of skipping
   - This ensures re-ingesting updates the index metadata

3. **Add tests in `src/lib/__tests__/ingest.test.ts`**:
   - Test `slugify()` with various inputs
   - Test that summary extraction handles abbreviations correctly (mock or extract the helper)
   - Test re-ingest updates existing entry (needs temp dir setup like wiki.test.ts)

4. **Verify**: `pnpm build && pnpm lint && pnpm test`
