import { clsx } from "clsx";
import { withPublicBasePath } from "@/lib/base-path";

const LOGO_MARK_SRC = withPublicBasePath("/logocrop.png");

/** Logo circular Technip (T.EN) para avatares en ranking, etc. */
export function TechnipLogoMark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const box =
    size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-8 w-8";

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 overflow-hidden rounded-full",
        box,
        className
      )}
      aria-hidden
    >
      <img
        src={LOGO_MARK_SRC}
        alt=""
        className="h-full w-full object-cover"
      />
    </span>
  );
}
