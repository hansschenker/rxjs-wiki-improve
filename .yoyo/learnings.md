# Project Learnings

## Derive metadata from source, not from LLM output
**Context:** Summary extraction for the wiki index originally parsed LLM-generated wiki pages looking for a `## Summary` heading. This broke when the LLM formatted its output slightly differently — sometimes using different heading text, sometimes omitting the section. Fixing the regex just led to whack-a-mole.
**Takeaway:** When you need structured metadata (summaries, titles, tags), derive it from the deterministic source content rather than parsing free-form LLM output. LLM output is for human consumption; metadata extraction should not depend on its formatting.

## Vertical slices need horizontal glue
**Context:** Built four feature verticals (ingest, browse, query, lint) each as library→API→UI across three sessions. By session three, there were four pages but no way to navigate between them — had to retrofit a NavHeader.
**Takeaway:** When building feature-by-feature in vertical slices, schedule connective tissue (navigation, shared state, cross-feature links) early, not as an afterthought. The individual features feel broken without it.
