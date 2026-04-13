Verdict: PASS
Reason: Both fixes are correctly implemented — `hasLinkTo()` replaces `content.includes()` in `updateRelatedPages` to avoid false positives on prose mentions, and orphaned comma collapse regex is correctly placed before trailing-comma cleanup in `stripBacklinksTo`; tests cover both scenarios and all pass.
