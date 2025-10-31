"use client";

import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import React, { useMemo } from "react";

export function AuthControlsClerk() {
  const { isLoaded, isSignedIn, user } = useUser();

  const initials = useMemo(() => {
    if (!user) return "AI";
    const base =
      user.fullName ??
      user.username ??
      [user.firstName, user.lastName].filter(Boolean).join(" ") ??
      user.id;
    return base
      .split(" ")
      .filter(Boolean)
      .map((c) => c[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "session@pending.dev";

  if (!isLoaded) return null;

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="rounded-md border border-brand/40 bg-brand/10 px-3 py-2 text-xs font-medium text-brand transition hover:bg-brand/20">
            Sign in to continue
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300">
          {isSignedIn ? `Session: ${email}` : "Authenticating…"}
        </span>
        <div className="flex h-9 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900 font-semibold text-slate-200">
            {initials}
          </div>
          <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
          <SignOutButton>
            <button className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </SignedIn>
    </>
  );
}
