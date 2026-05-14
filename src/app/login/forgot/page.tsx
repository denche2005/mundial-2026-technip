import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-md flex-1">
        <div className="rounded-2xl border border-[#dedede] bg-white p-6 md:p-8 shadow-lg">
          <h1 className="font-headline text-headline-md font-bold text-[#004c84]">
            Recuperar contraseña
          </h1>
          <p className="mt-3 text-sm text-[#555]">
            La recuperación automática por email no está activada en esta versión. Si no recuerdas tu
            contraseña, pide a un administrador que te ayude o crea una cuenta nueva con otro email si la
            política interna lo permite.
          </p>
          <p className="mt-4 text-sm text-[#555]">
            Si crees recordar la contraseña, vuelve al inicio de sesión e inténtalo de nuevo.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex text-sm font-semibold text-[#0070ef] hover:underline"
          >
            ← Volver al login
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
