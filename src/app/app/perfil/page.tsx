import { redirect } from "next/navigation";

/** Perfil retirado de la UI; redirige al simulador. */
export default function PerfilRedirectPage() {
  redirect("/app/simulador");
}
