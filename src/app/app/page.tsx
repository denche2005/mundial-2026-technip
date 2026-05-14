import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export default async function AppHome() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  redirect("/app/simulador");
}
