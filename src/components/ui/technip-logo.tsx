import { clsx } from "clsx";
import { withPublicBasePath } from "@/lib/base-path";

const LOGO_SRC = withPublicBasePath("/logo.png");

/** Logo horizontal Technip; respeta `NEXT_PUBLIC_BASE_PATH` en despliegue. */
export function TechnipLogo({
  className,
  alt = "Technip Energies",
}: {
  className?: string;
  alt?: string;
}) {
  return <img src={LOGO_SRC} alt={alt} className={clsx(className)} />;
}
