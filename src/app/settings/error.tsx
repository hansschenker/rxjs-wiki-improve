"use client";

import { PageError } from "@/components/ErrorBoundary";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      title="Settings error"
      description="Something went wrong loading settings."
      backHref="/"
      backLabel="← Home"
      error={error}
      reset={reset}
    />
  );
}
