Verdict: PASS
Reason: Both deduplications are correctly implemented — `buildCorpusStats` is merged into a single async function with `{ fullBody?: boolean }` option (defaulting to true), and `extractCitedSlugs` is extracted to `src/lib/citations.ts` with re-export from `query.ts` for backward compatibility. Tests updated correctly, build and tests pass.
