"use client";

import { useState } from "react";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface QueryResponse {
  answer: string;
  sources: string[];
  error?: string;
}

interface SaveState {
  status: "idle" | "editing" | "saving" | "saved" | "error";
  slug?: string;
  error?: string;
}

export default function QueryPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [saveTitle, setSaveTitle] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSaveState({ status: "idle" });

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setResult(data);
    } catch {
      setError("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  function handleSaveClick() {
    setSaveTitle(question.trim());
    setSaveState({ status: "editing" });
  }

  async function handleSaveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!saveTitle.trim() || !result) return;

    setSaveState({ status: "saving" });

    try {
      const res = await fetch("/api/query/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: saveTitle.trim(),
          content: result.answer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveState({ status: "error", error: data.error ?? "Save failed" });
        return;
      }

      setSaveState({ status: "saved", slug: data.slug });
    } catch {
      setSaveState({ status: "error", error: "Failed to connect to the server" });
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          ← Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight">Ask the Wiki</h1>
      <p className="mt-2 text-foreground/60">
        Ask a question and get a cited answer drawn from your wiki pages.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What would you like to know?"
          rows={3}
          className="w-full rounded-lg border border-foreground/20 bg-transparent px-4 py-3 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/30 resize-vertical"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {error && (
        <div className="mt-8 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <div className="rounded-lg border border-foreground/10 p-6">
            <MarkdownRenderer content={result.answer} />
          </div>

          {result.sources.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">
                Sources
              </h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {result.sources.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/wiki/${slug}`}
                      className="inline-block rounded-md border border-foreground/20 px-3 py-1 text-sm hover:bg-foreground/5 transition-colors"
                    >
                      {slug}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Save to Wiki */}
          <div className="border-t border-foreground/10 pt-4">
            {saveState.status === "idle" && (
              <button
                onClick={handleSaveClick}
                className="rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors"
              >
                Save to Wiki
              </button>
            )}

            {saveState.status === "editing" && (
              <form onSubmit={handleSaveSubmit} className="space-y-3">
                <label className="block text-sm font-medium text-foreground/70">
                  Page title
                </label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Enter a title for this wiki page"
                  className="w-full rounded-lg border border-foreground/20 bg-transparent px-4 py-2 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/30"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!saveTitle.trim()}
                    className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaveState({ status: "idle" })}
                    className="rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {saveState.status === "saving" && (
              <p className="text-sm text-foreground/60">Saving to wiki...</p>
            )}

            {saveState.status === "saved" && saveState.slug && (
              <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                Saved!{" "}
                <Link
                  href={`/wiki/${saveState.slug}`}
                  className="underline font-medium hover:opacity-80"
                >
                  View wiki page →
                </Link>
              </div>
            )}

            {saveState.status === "error" && (
              <div className="space-y-2">
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                  {saveState.error ?? "Failed to save"}
                </div>
                <button
                  onClick={handleSaveClick}
                  className="text-sm text-foreground/60 hover:text-foreground underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
