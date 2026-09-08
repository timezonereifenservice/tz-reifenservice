"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Wrench } from "lucide-react";
import { siteConfig } from "@/config/site";

export function DashboardLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/dashboard/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error || "Anmeldung fehlgeschlagen.");
        return;
      }

      router.replace("/dashboard/overview");
      router.refresh();
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte erneut versuchen.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-dvh bg-white">
      <div className="flex w-full flex-col justify-center px-8 py-12 sm:px-12 lg:w-[42%] lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-[380px]">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-dark text-brand-accent">
              <Wrench className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-dark">Time Zone</p>
              <p className="text-xs text-foreground/55">Reifenservice Dashboard</p>
            </div>
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/50">
            {siteConfig.name}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-dark sm:text-[2.15rem]">
            Dashboard Login
          </h1>
          <p className="mt-2 text-sm text-foreground/55">
            Melden Sie sich an, um Analytics und Leads einzusehen.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="sr-only">E-Mail</span>
              <input
                type="email"
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-Mail"
                className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-sm text-brand-dark outline-none transition-colors placeholder:text-foreground/40 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
              />
            </label>

            <label className="relative block">
              <span className="sr-only">Passwort</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort"
                className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 pr-12 text-sm text-brand-dark outline-none transition-colors placeholder:text-foreground/40 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-foreground/45 transition-colors hover:text-brand-dark"
                aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden />
                )}
              </button>
            </label>

            {error ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center rounded-lg bg-brand-dark px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Anmelden…
                </>
              ) : (
                "Anmelden"
              )}
            </button>
          </form>

          <p className="mt-6 text-xs text-foreground/40">
            Demo: admin@timezone-reifenservice.de / tz-admin-2026
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block lg:w-[58%]">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-[#1a1a1a] to-brand-accent/80" />
        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
            Autowerkstatt Pulheim
          </p>
          <h2 className="mt-2 max-w-md text-3xl font-extrabold leading-tight">
            Website Analytics & Leads für timezone-reifenservice.de
          </h2>
          <p className="mt-4 max-w-lg text-sm text-white/75">
            Verfolgen Sie Besucher, Kontaktanfragen und Service-Interesse — direkt
            aus Ihrer WordPress-Website.
          </p>
        </div>
      </div>
    </div>
  );
}
