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
        <Loader2 className="h-8 w-8 animate-spin text-[#0070ef]" />
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
        <div className="rounded-2xl border border-[#dedede] bg-white p-6 shadow-lg md:p-8">
          <h1 className="text-center font-headline text-headline-md font-bold text-[#004c84]">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-center text-sm text-[#555]">
            Porra interna Technip — Mundial 2026. Accede con tu email y contraseña.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-[#878787] uppercase">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#878787]" />
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.email@technip.com"
                  className="w-full rounded-xl border border-[#dedede] bg-[#f8f9fa] py-3 pl-10 pr-3 text-sm text-[#1a1a2e] placeholder:text-[#878787]/60 outline-none transition focus:border-[#0070ef] focus:ring-2 focus:ring-[#0070ef]/20"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="text-[10px] font-bold tracking-widest text-[#878787] uppercase">
                  Contraseña
                </label>
                <Link
                  href="/login/forgot"
                  className="text-xs font-semibold text-[#0070ef] hover:underline"
                >
                  ¿Olvidaste la contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#878787]" />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#dedede] bg-[#f8f9fa] py-3 pl-10 pr-3 text-sm text-[#1a1a2e] placeholder:text-[#878787]/60 outline-none focus:border-[#0070ef] focus:ring-2 focus:ring-[#0070ef]/20"
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-[#e84242]/30 bg-[#ffdad6] p-3 text-center text-sm text-[#e84242]">
                {error.includes("%") ? safeDecode(error) : error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0070ef] py-3.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(0,112,239,0.25)] transition hover:brightness-105 disabled:opacity-50"
            >
              {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Entrar"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#555]">
            ¿No tienes cuenta?{" "}
            <Link
              href={`/register${next !== "/app" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-semibold text-[#0070ef] hover:underline"
            >
              Registrarse
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

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
