"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
  const convex = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      console.warn("NEXT_PUBLIC_CONVEX_URL is not set; Convex disabled");
      return null;
    }
    return new ConvexReactClient(url);
  }, []);

  if (!convex) return <>{children}</>;
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
