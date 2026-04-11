Verdict: PASS
Reason: GET handler correctly returns `listWikiPages()` as `{ pages }`, GlobalSearch properly maps `{ slug, title }` → `{ id, label }` from the new lightweight endpoint instead of the heavy graph endpoint, and the smoke test validates the `IndexEntry` shape. All changes align with the task spec.
