"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, Lock, ArrowLeft } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { loginWithPassword } from "@/actions/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <AuthShell>
      <div className="flex flex-1 items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    </AuthShell>
  );
}

function LoginContent() {
  const params = useSearchParams();
  const router = useRouter();
  const next = params.get("next") ?? "/app";

  useEffect(() => {
    if (params.get("mode") !== "register") return;
    const qs = next !== "/app" ? `?next=${encodeURIComponent(next)}` : "";
    router.replace(`/register${qs}`);
  }, [params, next, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(params.get("error") ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const result = await loginWithPassword(normalizedEmail, password, next);

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

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-md flex-1">
        <div className="rounded-2xl border border-white/10 bg-[#161E2E] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.35)] md:p-8">
          <h1 className="text-center font-headline text-headline-md font-bold text-on-background">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            Porra interna Technip — Mundial 2026. Accede con el email y la contraseña que usaste al registrarte.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-label-caps text-[10px] font-bold tracking-widest text-on-surface-variant">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.email@technip.com"
                  className="w-full rounded-xl border border-white/10 bg-[#0D1117] py-3 pl-10 pr-3 text-sm text-on-background placeholder:text-on-surface-variant/50 outline-none ring-secondary/0 transition focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="text-label-caps text-[10px] font-bold tracking-widest text-on-surface-variant">
                  Contraseña
                </label>
                <Link
                  href="/login/forgot"
                  className="text-xs font-semibold text-secondary hover:underline"
                >
                  ¿Olvidaste la contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-[#0D1117] py-3 pl-10 pr-3 text-sm text-on-background placeholder:text-on-surface-variant/50 outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20"
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-error/40 bg-error/10 p-3 text-center text-sm text-error">
                {error.includes("%") ? safeDecode(error) : error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-secondary py-3.5 text-sm font-bold text-on-secondary shadow-[0_0_20px_rgba(255,185,85,0.25)] transition hover:brightness-105 disabled:opacity-50"
            >
              {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Entrar"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            ¿No tienes cuenta?{" "}
            <Link
              href={`/register${next !== "/app" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-semibold text-secondary hover:underline"
            >
              Registrarse
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

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
