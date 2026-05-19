import Link from "next/link";
import { TechnipLogo } from "@/components/ui/technip-logo";

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

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#f8f9fa] text-[#1a1a2e]">
      <header className="sticky top-0 z-20 border-b border-[#dedede] bg-white shadow-sm">
        <div className="mx-auto flex h-16 w-full max-w-lg items-center justify-center gap-2 px-4">
          <TechnipLogo className="h-8 w-auto" />
        </div>
      </header>

      <div className="flex flex-1 flex-col px-4 pb-8 pt-6 md:pt-8">{children}</div>

      <footer className="border-t border-[#dedede] bg-white py-6">
        <p className="text-center text-[11px] text-[#878787]">
          &copy; {new Date().getFullYear()} Technip Energies &mdash; Porra Mundial 2026
        </p>
        <nav className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-[#878787]">
          <Link href="#" className="transition-colors hover:text-[#0070ef]">
            Privacy
          </Link>
          <Link href="#" className="transition-colors hover:text-[#0070ef]">
            Terms
          </Link>
          <Link href="#" className="transition-colors hover:text-[#0070ef]">
            Support
          </Link>
        </nav>
      </footer>
    </div>
  );
}
