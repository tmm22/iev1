/**
 * Client-side hook to ensure user exists in Convex
 * 
 * USAGE: Call this hook in your root layout or app component
 * to ensure the authenticated user is created in Convex before
 * any queries run.
 * 
 * Example:
 * ```tsx
 * import { useEnsureUser } from "@/lib/convex/useEnsureUser";
 * 
 * export default function RootLayout() {
 *   const { isLoading, error } = useEnsureUser();
 *   
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   
 *   return <YourApp />;
 * }
 * ```
 */

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex/clientApi";

export function useEnsureUser() {
  const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { isSignedIn, isLoaded } = clerkEnabled ? useUser() : ({ isSignedIn: false, isLoaded: true } as any);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isEnsuring, setIsEnsuring] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [error, setError] = useState<Error | null>(null);
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const convexUsersApi = (api as any)?.users?.ensureUser;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ensureUser = clerkEnabled && convexUsersApi ? useMutation((api as any).users.ensureUser) : ((async () => {}) as any);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    async function ensureUserExists() {
      if (!clerkEnabled || !isLoaded || !isSignedIn || isEnsuring) {
        return;
      }

      setIsEnsuring(true);
      setError(null);

      try {
        await ensureUser();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to ensure user");
        console.error("[useEnsureUser] Error:", error);
        setError(error);
      } finally {
        setIsEnsuring(false);
      }
    }

    void ensureUserExists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkEnabled, isLoaded, isSignedIn, isEnsuring, ensureUser]);

  return {
    isLoading: (clerkEnabled && !isLoaded) || isEnsuring,
    error
  };
}
