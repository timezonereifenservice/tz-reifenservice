"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import {
  DASHBOARD_USER_ROLES,
  type CreateDashboardUserInput,
  type DashboardUserRole,
} from "@/lib/dashboard-users/types";

type CreateUserModalProps = {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  submitLabel?: string;
  pending?: boolean;
  initialValues?: {
    name: string;
    email: string;
    role: DashboardUserRole;
  };
  onSubmit: (
    input: CreateDashboardUserInput,
  ) => boolean | void | Promise<boolean | void>;
};

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-black/15 px-3 py-2.5 text-sm text-brand-dark outline-none transition-colors placeholder:text-foreground/40 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25";

export function CreateUserModal({
  open,
  onClose,
  mode = "create",
  submitLabel,
  pending = false,
  initialValues,
  onSubmit,
}: CreateUserModalProps) {
  const titleId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<DashboardUserRole>("Viewer");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initialValues?.name ?? "");
    setEmail(initialValues?.email ?? "");
    setPassword("");
    setRole(initialValues?.role ?? "Viewer");
    setShowPassword(false);
    setError(null);
    const timer = window.setTimeout(() => nameRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [open, initialValues]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || (mode === "create" && !password)) {
      setError(
        mode === "create"
          ? "Bitte Name, E-Mail und Passwort ausfüllen."
          : "Bitte Name und E-Mail ausfüllen.",
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Bitte eine gültige E-Mail-Adresse eingeben.");
      return;
    }

    if (password.length > 0 && password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }

    const created = await onSubmit({
      name: trimmedName,
      email: trimmedEmail,
      password,
      role,
    });
    if (created !== false) {
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-brand-dark/70 backdrop-blur-sm"
        aria-label="Dialog schließen"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="h-1.5 w-full bg-brand-accent" aria-hidden />

        <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <div>
            <h2
              id={titleId}
              className="text-xl font-extrabold tracking-tight text-brand-dark"
            >
              {mode === "edit" ? "Benutzer bearbeiten" : "Benutzer erstellen"}
            </h2>
            <p className="mt-1 text-sm text-foreground/55">
              {mode === "edit"
                ? "Details aktualisieren. Passwort leer lassen, um es nicht zu ändern."
                : "Neues Dashboard-Konto mit Rolle anlegen."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-brand-dark/50 transition-colors hover:bg-black/[0.04] hover:text-brand-dark"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6">
          <label className="block">
            <span className="text-sm font-semibold text-brand-dark">Name</span>
            <input
              ref={nameRef}
              type="text"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vollständiger Name"
              className={fieldClassName}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-brand-dark">E-Mail</span>
            <input
              type="email"
              name="email"
              required
              disabled={mode === "edit"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@timezone-reifenservice.de"
              className={fieldClassName}
            />
          </label>

          <label className="relative block">
            <span className="text-sm font-semibold text-brand-dark">Passwort</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required={mode === "create"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                mode === "edit"
                  ? "Leer lassen = unverändert"
                  : "Mindestens 8 Zeichen"
              }
              className={`${fieldClassName} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute bottom-2.5 right-2 rounded-md p-1.5 text-foreground/45 hover:text-brand-dark"
              aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-brand-dark">Rolle</span>
            <select
              name="role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value as DashboardUserRole)}
              className={fieldClassName}
            >
              {DASHBOARD_USER_ROLES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-foreground/50">
              Admin: voller Zugriff inkl. Benutzerverwaltung · Viewer: nur Lesen
            </p>
          </label>

          {error ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm font-semibold text-brand-dark transition-colors hover:border-brand-accent/40"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-brand-dark px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending
                ? "Speichern…"
                : submitLabel ?? (mode === "edit" ? "Speichern" : "Erstellen")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
