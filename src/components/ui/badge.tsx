import { clsx } from "clsx";

interface BadgeProps {
  variant: "success" | "warning" | "error" | "neutral" | "primary" | "gold" | "emerald";
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeProps["variant"], string> = {
  success: "bg-tertiary/15 text-tertiary border-tertiary/30",
  emerald: "bg-tertiary/15 text-tertiary border-tertiary/30",
  warning: "bg-secondary/15 text-secondary border-secondary/30",
  gold: "bg-secondary/15 text-secondary border-secondary/30",
  error: "bg-error/15 text-error border-error/30",
  neutral: "bg-white/5 text-on-surface-variant border-white/10",
  primary: "bg-primary-container/60 text-primary border-primary/30",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
