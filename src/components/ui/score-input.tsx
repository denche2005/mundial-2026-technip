"use client";

import { clsx } from "clsx";

interface ScoreInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  highlighted?: boolean;
  saved?: boolean;
}

/**
 * Score input used inside match prediction cards. Behaves like a 0-20 number
 * input but rendered with the design system's tall, gold-themed aesthetic.
 * Honours `saved` (emerald) and `highlighted` (3-pt exact match) states.
 */
export function ScoreInput({ value, onChange, disabled, highlighted, saved }: ScoreInputProps) {
  return (
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      min="0"
      max="20"
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "" || (Number.parseInt(v, 10) >= 0 && Number.parseInt(v, 10) <= 20)) {
          onChange(v);
        }
      }}
      disabled={disabled}
      placeholder="-"
      aria-label="Marcador"
      className={clsx(
        "w-12 h-16 rounded-lg border text-center font-display text-3xl font-bold outline-none transition",
        "bg-surface-container/80 border-white/10 text-secondary",
        "focus:border-secondary focus:ring-2 focus:ring-secondary/20",
        disabled && "opacity-40 cursor-not-allowed",
        saved &&
          "bg-tertiary/15 border-tertiary/40 text-tertiary focus:ring-tertiary/30 focus:border-tertiary",
        highlighted &&
          "bg-tertiary/15 border-tertiary/60 text-tertiary shadow-[0_0_14px_rgba(89,222,155,0.35)]"
      )}
    />
  );
}
