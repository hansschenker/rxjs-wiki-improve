Title: Streaming LLM responses for query
Files: src/lib/llm.ts, src/app/api/query/stream/route.ts (new), src/app/query/page.tsx, src/lib/__tests__/llm.test.ts
Issue: none

## Description

All LLM calls currently block until complete (10-30 seconds with no feedback). This is the #2 gap in the assessment. The query operation is the best candidate for streaming because:
- It's the most user-facing LLM call (users watch and wait)
- The answer is a single text generation (unlike ingest which has side effects after generation)
- Vercel AI SDK has `streamText` built in with `toTextStreamResponse()`

### Steps

1. **Add `callLLMStream` to `src/lib/llm.ts`** — A new exported function alongside `callLLM`:
   ```typescript
   import { generateText, streamText } from "ai";
   
   export function callLLMStream(
     systemPrompt: string,
     userMessage: string,
   ): ReturnType<typeof streamText> {
     const model = getModel();
     return streamText({
       model,
       system: systemPrompt,
       messages: [{ role: "user", content: userMessage }],
       maxOutputTokens: 4096,
     });
   }
   ```
   Note: `streamText` returns a `StreamTextResult` which has `.toTextStreamResponse()` for sending as an HTTP response and `.text` (a promise) for getting the full text. `getModel()` is already a private function in llm.ts; it just needs to be reused.

2. **Create `src/app/api/query/stream/route.ts`** — A new streaming endpoint:
   - Accept POST with `{ question: string }`
   - Reuse the existing search/context-building logic from `query.ts` but factor it so the search + context assembly can be called separately from the LLM generation
   - Import the search/context functions and `callLLMStream`
   - Build the system prompt (same as `query()` does), then stream the LLM response
   - Return `result.toTextStreamResponse()`
   - The sources list can't be computed mid-stream, so return it as a custom header `X-Wiki-Sources` (JSON-encoded array of slugs based on the pages loaded into context) OR append sources as a final non-streamed JSON after the stream ends

   Simpler approach: Since we need sources, use a two-phase response:
   - Phase 1: Return sources + start streaming in the response
   - OR: Use a simpler approach — stream the text, and the client extracts sources from the loaded context pages (which are known before streaming starts). Pass the source slugs as a response header.

   Implementation:
   ```typescript
   export async function POST(request: NextRequest) {
     const { question } = await request.json();
     // ... validation ...
     
     // Reuse search logic to find relevant pages and build context
     const entries = await listWikiPages();
     const selectedSlugs = await searchIndex(question, entries);
     const context = await buildContext(selectedSlugs);
     const systemPrompt = /* build as in query() */;
     
     // Stream the LLM response
     const result = callLLMStream(systemPrompt, question);
     
     return result.toTextStreamResponse({
       headers: {
         "X-Wiki-Sources": JSON.stringify(selectedSlugs),
       },
     });
   }
   ```

   For this to work, `searchIndex` and `buildContext` need to be exported from query.ts. Check if they already are — if not, export them.

3. **Export search helpers from `src/lib/query.ts`** — Make `searchIndex` and `buildContext` exported if they aren't already. Also export the prompt-building logic or extract the system prompt assembly into a helper function like `buildQuerySystemPrompt(context, entries, selectedSlugs)`.

4. **Update `src/app/query/page.tsx`** — Add streaming support to the client:
   - Keep the existing non-streaming path as fallback
   - For the primary flow, use `fetch` to the streaming endpoint
   - Read the response as a `ReadableStream` using `reader = response.body.getReader()`
   - Progressively update the answer state as chunks arrive
   - Read `X-Wiki-Sources` header for the sources list
   - Show a typing indicator while streaming
   - The "Save to Wiki" button appears after streaming completes

5. **Add a test for `callLLMStream`** in `src/lib/__tests__/llm.test.ts`:
   - Test that calling `callLLMStream` without an API key throws (same as `callLLM`)
   - Test that the function returns an object with expected stream methods (mock if needed)

### Verification

```sh
pnpm build && pnpm lint && pnpm test
```

All tests must pass. The build must succeed. Manually verify (if possible) that the streaming endpoint compiles and the query page renders without errors.

### Notes
- Keep the non-streaming `/api/query` endpoint intact — it's used by the "save answer" flow and is a simpler fallback
- The streaming endpoint is additive, not a replacement
- `toTextStreamResponse()` returns a standard `Response` with `Content-Type: text/plain; charset=utf-8` and `Transfer-Encoding: chunked`
