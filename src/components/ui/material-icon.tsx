import type { ComponentPropsWithoutRef } from "react";
import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

type MaterialIconSize = 14 | 16 | 18 | 20 | 24 | 28 | 32 | 40 | 48;

interface MaterialIconProps
  extends Omit<ComponentPropsWithoutRef<"svg">, "ref"> {
  icon: LucideIcon;
  size?: MaterialIconSize;
  strokeWidth?: number;
}

/**
 * Thin wrapper around lucide-react icons that bakes in our standard sizes
 * and stroke widths. Using this everywhere keeps the icon language consistent
 * across the app — same visual weight as Material Symbols Outlined would have.
 */
export function MaterialIcon({
  icon: Icon,
  size = 20,
  strokeWidth = 1.75,
  className,
  ...rest
}: MaterialIconProps) {
  return (
    <Icon
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      className={clsx("shrink-0", className)}
      {...rest}
    />
  );
}
