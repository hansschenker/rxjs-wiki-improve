import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight">LLM Wiki</h1>
        <p className="mt-6 text-lg text-foreground/70 leading-relaxed">
          Your personal knowledge base powered by LLMs. Ingest sources, ask
          questions, and browse an ever-growing wiki of interlinked markdown
          pages.
        </p>
        <div className="mt-8">
          <Link
            href="/wiki"
            className="inline-block rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90 transition-opacity"
          >
            Browse Wiki →
          </Link>
        </div>
      </div>
    </main>
  );
}
