import { NextResponse } from "next/server";

import { getConvexClient } from "@/lib/uploadthing/convexAdapter";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Upload log inspection disabled in production." },
      { status: 403 }
    );
  }

  const client = await getConvexClient();
  if (!client) {
    return NextResponse.json(
      { error: "Convex URL missing; configure NEXT_PUBLIC_CONVEX_URL." },
      { status: 500 }
    );
  }

  try {
    const records = await client.query(
      "internal/uploads:listUploads" as any,
      { limit: 25 }
    );

    return NextResponse.json({ records });
  } catch (error) {
    console.error("[uploadthing] Failed to fetch upload logs", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
