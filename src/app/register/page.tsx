"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Loader2,
  Lock,
  User,
  Shield,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { registerWithPassword } from "@/actions/auth";

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterFallback() {
  return (
    <AuthShell>
      <div className="flex flex-1 items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    </AuthShell>
  );
}

function RegisterContent() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/app";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!agreed) {
      setError("Debes aceptar los términos para continuar.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const result = await registerWithPassword(
      normalizedEmail,
      password,
      fullName.trim(),
      next
    );

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.redirectTo) {
      // Full page navigation ensures the cookie is applied before reaching the protected route
      window.location.href = result.redirectTo;
    } else {
      setError("Respuesta inválida del servidor. ¿Está Supabase configurado?");
      setLoading(false);
    }
  }

  const nextQuery =
    next !== "/app" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-md flex-1 pb-6">
        <div className="rounded-2xl border border-white/10 bg-[#161E2E] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Mundial 2026 Access
            </span>
          </div>

          <h1 className="mt-6 text-center font-headline text-headline-lg font-bold text-on-background">
            Únete al Mundial 2026
          </h1>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            Crea tu cuenta, elige tu ciudad favorita y comienza a predecir.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field
              label="Nombre completo"
              icon={<User className="h-4 w-4 text-on-surface-variant" />}
            >
              <input
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full rounded-xl border border-white/10 bg-[#0D1117] py-3 pl-10 pr-3 text-sm text-on-background placeholder:text-on-surface-variant/50 outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20"
              />
            </Field>

            <Field
              label="Email"
              icon={<Mail className="h-4 w-4 text-on-surface-variant" />}
            >
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-xl border border-white/10 bg-[#0D1117] py-3 pl-10 pr-3 text-sm text-on-background placeholder:text-on-surface-variant/50 outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20"
              />
            </Field>

            <Field
              label="Contraseña"
              icon={<Lock className="h-4 w-4 text-on-surface-variant" />}
            >
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-xl border border-white/10 bg-[#0D1117] py-3 pl-10 pr-3 text-sm text-on-background placeholder:text-on-surface-variant/50 outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20"
              />
            </Field>

            <Field
              label="Confirmar contraseña"
              icon={<Shield className="h-4 w-4 text-on-surface-variant" />}
            >
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="w-full rounded-xl border border-white/10 bg-[#0D1117] py-3 pl-10 pr-3 text-sm text-on-background placeholder:text-on-surface-variant/50 outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20"
              />
            </Field>

            <label className="flex cursor-pointer items-start gap-3 pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-[#0D1117] text-secondary focus:ring-secondary"
              />
              <span className="text-sm text-on-surface-variant leading-snug">
                Acepto los{" "}
                <Link href="#" className="font-semibold text-secondary hover:underline">
                  Términos y Condiciones
                </Link>{" "}
                y la{" "}
                <Link href="#" className="font-semibold text-secondary hover:underline">
                  Política de Privacidad
                </Link>{" "}
                de Mundial 2026.
              </span>
            </label>

            {error ? (
              <div className="rounded-xl border border-error/40 bg-error/10 p-3 text-center text-sm text-error">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3.5 text-sm font-bold text-on-secondary shadow-[0_0_20px_rgba(255,185,85,0.25)] transition hover:brightness-105 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Crear Cuenta
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            ¿Ya tienes cuenta?{" "}
            <Link
              href={`/login${nextQuery}`}
              className="font-semibold text-secondary hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-label-caps text-[10px] font-bold tracking-widest text-on-surface-variant">
        {label}
      </label>
      <div className="relative [&>input]:pl-10">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}
