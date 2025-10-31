import type { Metadata } from "next";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { Inter } from "next/font/google";

import { editorFileRouter } from "@/app/api/uploadthing/core";

import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Image Editor",
  description: "Phase 0 scaffold for the AI-enhanced image editor."
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const Shell = (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-slate-950`}>
        <NextSSRPlugin routerConfig={extractRouterConfig(editorFileRouter)} />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
  if (!hasClerk) return Shell;
  const { ClerkProvider } = await import("@clerk/nextjs");
  return <ClerkProvider>{Shell}</ClerkProvider>;
}
