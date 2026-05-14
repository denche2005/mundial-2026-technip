import Link from "next/link";

/**
 * Inline Goal icon — avoids importing lucide from server routes (fixes flaky
 * `.next/server/... Missing chunk xxx.js` on pages that only compose AuthShell).
 */
function GoalIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 13V2l8 4-8 4" />
      <path d="M20.561 10.222a9 9 0 1 1-12.55-5.29" />
      <path d="M8.002 9.997a5 5 0 1 0 8.9 2.02" />
    </svg>
  );
}

/**
 * Shared chrome for /login and /register: MUNDIAL 2026 top bar + landing-style footer.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#0B101B] text-on-background">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B101B]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-lg items-center justify-center gap-2 px-4">
          <GoalIcon className="h-6 w-6 text-secondary shrink-0" />
          <span className="font-headline text-headline-md font-bold tracking-tight text-secondary italic">
            MUNDIAL 2026
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-4 pb-8 pt-6 md:pt-8">{children}</div>

      <footer className="border-t border-white/10 py-6">
        <p className="text-center text-[11px] text-on-surface-variant">
          © {new Date().getFullYear()} LA PORRA — EL RITMO DEL FÚTBOL
        </p>
        <nav className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-on-surface-variant">
          <Link href="#" className="transition-colors hover:text-secondary">
            Privacy
          </Link>
          <Link href="#" className="transition-colors hover:text-secondary">
            Terms
          </Link>
          <Link href="#" className="transition-colors hover:text-secondary">
            Support
          </Link>
        </nav>
      </footer>
    </div>
  );
}
