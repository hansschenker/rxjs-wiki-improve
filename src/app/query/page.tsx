"use client";

import { useState } from "react";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface QueryResponse {
  answer: string;
  sources: string[];
  error?: string;
}

export default function QueryPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

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
        </div>
      )}
    </main>
  );
}
