export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight">LLM Wiki</h1>
        <p className="mt-6 text-lg text-foreground/70 leading-relaxed">
          Your personal knowledge base powered by LLMs. Ingest sources, ask
          questions, and browse an ever-growing wiki of interlinked markdown
          pages.
        </p>
        <p className="mt-4 text-sm text-foreground/50">
          Use the navigation above to get started — ingest content, query your
          wiki, or browse existing pages.
        </p>
      </div>
    </main>
  );
}
