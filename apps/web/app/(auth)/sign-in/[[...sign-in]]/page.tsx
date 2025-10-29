"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <SignIn
          path="/sign-in"
          routing="path"
          appearance={{
            elements: {
              card: "bg-slate-950/80 border border-slate-800",
              footer: "hidden"
            }
          }}
        />
      </div>
    </main>
  );
}
