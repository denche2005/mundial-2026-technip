import { getFlagUrl, getFlagUrl2x } from "@/lib/bracket/flags";
import { clsx } from "clsx";

interface FlagProps {
  code: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  rounded?: "sm" | "md" | "full";
  className?: string;
}

const SIZES: Record<NonNullable<FlagProps["size"]>, string> = {
  xs: "w-4 h-3",
  sm: "w-6 h-4",
  md: "w-8 h-6",
  lg: "w-10 h-7",
  xl: "w-14 h-10",
};

const ROUNDED: Record<NonNullable<FlagProps["rounded"]>, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  full: "rounded-full",
};

/**
 * Country flag served from flagcdn.com with srcSet for retina. The mapping
 * from FIFA-style 3-letter codes to ISO-3166-1 alpha-2 lives in
 * `lib/bracket/flags.ts`. Renders an empty placeholder if the code is unknown
 * so layouts don't shift unexpectedly.
 */
export function Flag({ code, size = "md", rounded = "sm", className }: FlagProps) {
  const url = getFlagUrl(code);
  const url2x = getFlagUrl2x(code);
  if (!url) {
    return (
      <span
        aria-hidden
        className={clsx(SIZES[size], "bg-surface-container", ROUNDED[rounded], className)}
      />
    );
  }

  return (
    <img
      src={url}
      srcSet={`${url2x} 2x`}
      alt={code}
      loading="lazy"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      className={clsx(
        SIZES[size],
        ROUNDED[rounded],
        "object-cover shadow-sm inline-block",
        className
      )}
    />
  );
}
