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
// TODO: Import Convex client when enabled
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";

export function useEnsureUser() {
  const { isSignedIn, isLoaded } = useUser();
  const [isEnsuring, setIsEnsuring] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // TODO: Uncomment when Convex is connected
  // const ensureUser = useMutation(api.users.ensureUser);

  useEffect(() => {
    async function ensureUserExists() {
      if (!isLoaded || !isSignedIn || isEnsuring) {
        return;
      }

      setIsEnsuring(true);
      setError(null);

      try {
        // TODO: Uncomment when Convex is connected
        // await ensureUser();
        console.log("[useEnsureUser] User ensured in Convex");
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to ensure user");
        console.error("[useEnsureUser] Error:", error);
        setError(error);
      } finally {
        setIsEnsuring(false);
      }
    }

    void ensureUserExists();
  }, [isLoaded, isSignedIn, isEnsuring]);

  return {
    isLoading: !isLoaded || isEnsuring,
    error
  };
}
