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
        <Loader2 className="h-8 w-8 animate-spin text-[#0070ef]" />
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
      window.location.href = result.redirectTo;
    } else {
      setError("Respuesta inválida del servidor. ¿Está Supabase configurado?");
      setLoading(false);
    }
  }

  const nextQuery =
    next !== "/app" ? `?next=${encodeURIComponent(next)}` : "";

  const inputCls =
    "w-full rounded-xl border border-[#dedede] bg-[#f8f9fa] py-3 pl-10 pr-3 text-sm text-[#1a1a2e] placeholder:text-[#878787]/60 outline-none focus:border-[#0070ef] focus:ring-2 focus:ring-[#0070ef]/20";

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-md flex-1 pb-6">
        <div className="rounded-2xl border border-[#dedede] bg-white p-6 shadow-lg md:p-8">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0070ef]/30 bg-[#e0efff] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#0070ef]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0070ef]" />
              Mundial 2026
            </span>
          </div>

          <h1 className="mt-6 text-center font-headline text-headline-lg font-bold text-[#004c84]">
            Únete al Mundial 2026
          </h1>
          <p className="mt-2 text-center text-sm text-[#555]">
            Crea tu cuenta y comienza a predecir.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field
              label="Nombre completo"
              icon={<User className="h-4 w-4 text-[#878787]" />}
            >
              <input
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                className={inputCls}
              />
            </Field>

            <Field
              label="Email"
              icon={<Mail className="h-4 w-4 text-[#878787]" />}
            >
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className={inputCls}
              />
            </Field>

            <Field
              label="Contraseña"
              icon={<Lock className="h-4 w-4 text-[#878787]" />}
            >
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={inputCls}
              />
            </Field>

            <Field
              label="Confirmar contraseña"
              icon={<Shield className="h-4 w-4 text-[#878787]" />}
            >
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className={inputCls}
              />
            </Field>

            <label className="flex cursor-pointer items-start gap-3 pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[#dedede] bg-[#f8f9fa] text-[#0070ef] focus:ring-[#0070ef]"
              />
              <span className="text-sm text-[#555] leading-snug">
                Entiendo que mi{" "}
                <strong className="text-[#1a1a2e]">cuadro y predicción de goleador</strong>{" "}
                serán visibles para el resto de participantes en el ranking interno.
              </span>
            </label>

            {error ? (
              <div className="rounded-xl border border-[#e84242]/30 bg-[#ffdad6] p-3 text-center text-sm text-[#e84242]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0070ef] py-3.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(0,112,239,0.25)] transition hover:brightness-105 disabled:opacity-50"
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

          <p className="mt-8 text-center text-sm text-[#555]">
            ¿Ya tienes cuenta?{" "}
            <Link
              href={`/login${nextQuery}`}
              className="font-semibold text-[#0070ef] hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-[#555] hover:text-[#0070ef] transition-colors"
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
      <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-[#878787] uppercase">
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
