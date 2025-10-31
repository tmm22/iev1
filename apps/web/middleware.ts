import { NextResponse } from "next/server";

const clerkEnvMissing =
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY;

export default async function middleware(req: any) {
  if (clerkEnvMissing) return NextResponse.next();

  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
  const isProtectedRoute = createRouteMatcher(["/editor(.*)"]);
  const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

  return (clerkMiddleware(async (auth, reqInner) => {
    try {
      const authState = await auth();

      if (isProtectedRoute(reqInner) && !authState.userId) {
        return authState.redirectToSignIn({ returnBackUrl: reqInner.url });
      }

      if (!isPublicRoute(reqInner) && !authState.userId) {
        return authState.redirectToSignIn({ returnBackUrl: reqInner.url });
      }
    } catch {
      return NextResponse.next();
    }

    return NextResponse.next();
  }) as any)(req);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)"
  ]
};
