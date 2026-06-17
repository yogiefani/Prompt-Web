"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { ArrowRight, Loader2, LogOut } from "lucide-react";
import { FadeIn } from "@/components/motion-primitives";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export function SupabaseLoginPanel() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const reason = searchParams.get("reason");
  const initialMessage =
    reason === "auth-required"
      ? "Silakan login dulu untuk membuka halaman tersebut."
      : reason === "missing-supabase-config"
        ? "Supabase belum dikonfigurasi. Isi .env.local sebelum membuka halaman member."
        : "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  function redirectAfterLogin() {
    const params = new URLSearchParams();

    if (nextPath?.startsWith("/") && !nextPath.startsWith("//")) {
      params.set("next", nextPath);
    }

    const continuePath = params.size > 0 ? `/auth/continue?${params.toString()}` : "/auth/continue";
    window.location.replace(continuePath);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!isSupabaseConfigured || !supabase) {
      setMessage("Layanan database belum dikonfigurasi. Hubungi administrator.");
      return;
    }

    setStatus("loading");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("idle");
      setMessage(error.message);
      return;
    }

    setUser(data.user);
    setStatus("success");
    setMessage("Login berhasil. Mengalihkan halaman...");
    redirectAfterLogin();
  }



  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setMessage("Session sudah keluar.");
  }

  function handleLanjutkanState() {
    if (!user) return;
    setStatus("loading");
    redirectAfterLogin();
  }

  return (
    <div className="rounded-[28px] bg-[var(--color-arctic-mist)] p-6 md:p-8">
      <FadeIn className="rounded-[24px] border border-white bg-white/80 p-5">
        {user ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[var(--color-mint-glaze)] p-4">
              <p className="text-sm font-semibold text-[var(--color-obsidian)]">Session aktif</p>
              <p className="mt-1 break-all text-sm font-medium text-[var(--color-silver-pine)]">
                {user.email}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className="primary-button flex-1 justify-center"
                type="button"
                onClick={handleLanjutkanState}
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <>
                    Lanjutkan
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
              <button className="secondary-button flex-1 justify-center" type="button" onClick={handleLogout} disabled={status === "loading"}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="text-sm font-semibold text-[var(--color-obsidian)]" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="form-input mt-2"
                placeholder="nama@email.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--color-obsidian)]" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="form-input mt-2"
                placeholder="Password Akun"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <button className="primary-button w-full justify-center" type="submit" disabled={status === "loading"}>
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              )}
              {status === "loading" ? "Memeriksa akun..." : "Login Masuk"}
            </button>


          </form>
        )}

        {message ? (
          <p className="mt-4 rounded-2xl bg-[var(--color-whisper-fade-yellow)] px-4 py-3 text-sm font-semibold leading-6 text-[var(--color-silver-pine)]">
            {message}
          </p>
        ) : null}
      </FadeIn>
    </div>
  );
}
