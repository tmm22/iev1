import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon
} from "@heroicons/react/24/outline";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
  useUser
} from "@clerk/nextjs";
import { useEditorStore } from "@/lib/state/editorStore";
import { CanvasPlaceholder } from "./canvas/CanvasPlaceholder";
import { UploadPanel } from "./panels/UploadPanel";
import { PromptPanel } from "./panels/PromptPanel";
import { EditorShellSkeleton } from "./EditorShellSkeleton";

const NavButton = ({
  icon: Icon,
  label,
  onClick,
  disabled
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center gap-2 rounded-md border border-slate-800 px-3 py-2 text-xs font-medium transition ${
      disabled
        ? "cursor-not-allowed bg-slate-900/50 text-slate-500"
        : "bg-slate-900 text-slate-200 hover:bg-slate-800"
    }`}
  >
    <Icon className="h-4 w-4" aria-hidden="true" />
    {label}
  </button>
	);

export default function EditorShell() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { undo, redo, canUndo, canRedo } = useEditorStore((state) => ({
    undo: state.undo,
    redo: state.redo,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1
  }));

  const initials = useMemo(() => {
    if (!user) {
      return "AI";
    }
    const base =
      user.fullName ??
      user.username ??
      [user.firstName, user.lastName].filter(Boolean).join(" ") ??
      user.id;
    return base
      .split(" ")
      .filter(Boolean)
      .map((chunk) => chunk[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "session@pending.dev";

  if (!isLoaded) {
    return <EditorShellSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-900/60 bg-slate-950/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold text-slate-300">
            ← Back to overview
          </Link>
          <span className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs uppercase tracking-widest text-brand">
            Phase 0 Shell
          </span>
          <div className="flex gap-2">
            <NavButton
              icon={ArrowUturnLeftIcon}
              label="Undo"
              onClick={undo}
              disabled={!canUndo}
            />
            <NavButton
              icon={ArrowUturnRightIcon}
              label="Redo"
              onClick={redo}
              disabled={!canRedo}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
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
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-80 flex-col gap-6 border-r border-slate-900/60 bg-slate-950 p-5">
          <PromptPanel />
          <UploadPanel />
        </aside>
        <main className="flex flex-1 flex-col gap-6 overflow-hidden bg-slate-950 p-6">
          <section className="flex flex-1 overflow-hidden rounded-2xl border border-slate-900/60 bg-slate-900/40 shadow-inner">
            <CanvasPlaceholder />
          </section>
        </main>
      </div>
      <footer className="flex items-center justify-between border-t border-slate-900/60 bg-slate-950 px-6 py-3 text-xs text-slate-500">
        <span>
          AI Image Editor – Phase 0 scaffold. AI providers and uploads currently
          operate in mock mode.
        </span>
        <span>
          Undo: {canUndo ? "available" : "n/a"} · Redo: {canRedo ? "available" : "n/a"}
        </span>
      </footer>
    </div>
  );
}
