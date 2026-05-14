"use client";

import { useEffect } from "react";
import { withPublicBasePath } from "@/lib/base-path";

/** Registers `sw.js` under the public base path in production only. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const url = `${withPublicBasePath("/sw.js")}`;
    void navigator.serviceWorker.register(url).catch(() => {});
  }, []);
  return null;
}
