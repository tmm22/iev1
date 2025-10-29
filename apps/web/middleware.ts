import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/editor(.*)"]);
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)"
]);

const clerkEnvMissing =
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY;

export default clerkMiddleware(async (auth, req) => {
  if (clerkEnvMissing) {
    return NextResponse.next();
  }

  const authState = await auth();

  if (isProtectedRoute(req) && !authState.userId) {
    return authState.redirectToSignIn({ returnBackUrl: req.url });
  }

  if (!isPublicRoute(req) && !authState.userId) {
    return authState.redirectToSignIn({ returnBackUrl: req.url });
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)"
  ]
};
