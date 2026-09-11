import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function NavigationProgress() {
  const [hydrated, setHydrated] = useState(false);
  const routerIsLoading = useRouterState({
    select: (state) =>
      state.status === "pending" || state.isLoading || state.isTransitioning,
  });
  const isLoading = hydrated && routerIsLoading;

  useEffect(() => setHydrated(true), []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden"
      role="progressbar"
      aria-label="Carregando página"
      aria-hidden={!isLoading}
    >
      <div
        className={`h-full origin-left bg-accent shadow-sm transition-[transform,opacity] duration-200 motion-reduce:transition-none ${
          isLoading ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
        }`}
      />
    </div>
  );
}