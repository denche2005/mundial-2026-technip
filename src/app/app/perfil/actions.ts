"use server";

import { revalidatePath } from "next/cache";
import { requireSessionUser } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/service";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function revalidateProfilePaths() {
  revalidatePath("/app/perfil");
  revalidatePath("/app", "layout");
  revalidatePath("/app/ranking");
  revalidatePath("/app/simulador");
}

export async function updateProfileFullName(formData: FormData) {
  const user = await requireSessionUser();
  const raw = String(formData.get("full_name") ?? "").trim();
  if (raw.length < 2) {
    return { error: "El nombre debe tener al menos 2 caracteres." };
  }
  if (raw.length > 80) {
    return { error: "El nombre es demasiado largo (máx. 80)." };
  }

  let service;
  try {
    service = createServiceClient();
  } catch {
    return { error: "Configuración del servidor incompleta." };
  }

  const { error } = await service
    .from("profiles")
    .update({ full_name: raw })
    .eq("id", user.id);

  if (error) {
    return { error: "No se pudo guardar el nombre." };
  }

  revalidateProfilePaths();
  return { success: true as const };
}

export async function updateProfileAvatar(formData: FormData) {
  const user = await requireSessionUser();
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen." };
  }

  const mime = file.type;
  if (!MIME_EXT[mime]) {
    return { error: "Formato no válido (usa JPG, PNG o WebP)." };
  }
  if (file.size > 1.5 * 1024 * 1024) {
    return { error: "La imagen supera 1,5 MB." };
  }

  let service;
  try {
    service = createServiceClient();
  } catch {
    return { error: "Configuración del servidor incompleta." };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = MIME_EXT[mime];
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: upErr } = await service.storage
    .from("avatars")
    .upload(path, buf, {
      contentType: mime,
      upsert: true,
    });

  if (upErr) {
    return {
      error:
        "No se pudo subir la foto. Comprueba que el bucket de avatares exista en Supabase Storage y los permisos del rol de servicio.",
    };
  }

  const {
    data: { publicUrl },
  } = service.storage.from("avatars").getPublicUrl(path);

  const { error: dbErr } = await service
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (dbErr) {
    return { error: "No se pudo guardar la URL del avatar." };
  }

  revalidateProfilePaths();
  return { success: true as const, avatarUrl: publicUrl };
}
