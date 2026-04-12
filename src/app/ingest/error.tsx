"use client";

import { PageError } from "@/components/ErrorBoundary";

export default function IngestError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      title="Ingest error"
      description="Something went wrong while ingesting content."
      backHref="/"
      backLabel="← Home"
      error={error}
      reset={reset}
    />
  );
}
