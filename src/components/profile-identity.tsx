"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { updateProfileAvatar, updateProfileFullName } from "@/app/app/perfil/actions";

interface Props {
  initialName: string;
  initialAvatarUrl: string | null;
}

export function ProfileIdentity({
  initialName,
  initialAvatarUrl,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [savedName, setSavedName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [msg, setMsg] = useState("");
  const [pending, startTransition] = useTransition();
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    setName(initialName);
    setSavedName(initialName);
  }, [initialName]);

  useEffect(() => {
    setAvatarUrl(initialAvatarUrl);
  }, [initialAvatarUrl]);

  function onAvatarPick() {
    fileRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMsg("");
    startTransition(async () => {
      const fd = new FormData();
      fd.set("avatar", file);
      const res = await updateProfileAvatar(fd);
      if (res.error) {
        setMsg(res.error);
        return;
      }
      if (res.avatarUrl) setAvatarUrl(res.avatarUrl);
    });
  }

  async function saveName() {
    const trimmed = name.trim();
    if (trimmed === savedName.trim()) return;
    setMsg("");
    setSavingName(true);
    const fd = new FormData();
    fd.set("full_name", trimmed);
    const res = await updateProfileFullName(fd);
    setSavingName(false);
    if (res.error) {
      setMsg(res.error);
      setName(savedName);
      return;
    }
    setSavedName(trimmed);
    setName(trimmed);
  }

  return (
    <section className="w-full">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={onAvatarPick}
            disabled={pending}
            className="relative block rounded-full border-2 border-secondary p-0.5 outline-none transition hover:shadow-[0_0_18px_rgba(255,185,85,0.25)] focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-60"
            aria-label="Cambiar foto de perfil"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-surface-container-high">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-on-surface">
                  {(name || savedName || "?").charAt(0).toUpperCase()}
                </span>
              )}
              {pending && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-7 w-7 animate-spin text-secondary" />
                </div>
              )}
            </div>
          </button>
          <button
            type="button"
            onClick={onAvatarPick}
            disabled={pending}
            className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-on-secondary shadow-md transition hover:brightness-110 active:scale-95 disabled:opacity-50"
            aria-label="Editar foto"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <label className="sr-only" htmlFor="profile-full-name">
            Nombre visible
          </label>
          <div className="relative">
            <input
              id="profile-full-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => void saveName()}
              maxLength={80}
              autoComplete="nickname"
              className="w-full border-0 border-b border-white/15 bg-transparent px-0 py-1.5 font-headline-md text-xl font-bold leading-tight text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-b-secondary focus:ring-0"
            />
            {savingName && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-secondary" />
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-on-surface-variant">
            Toca la foto o el lápiz para cambiarla. El nombre se guarda al salir del campo.
          </p>
          {msg ? <p className="mt-2 text-xs text-error">{msg}</p> : null}
        </div>
      </div>
    </section>
  );
}
