"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { ArrowRight, CheckCircle2, Loader2, LogOut, ShieldCheck, UserRoundCheck } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion-primitives";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const roleOptions = [
  {
    label: "Superadmin",
    description: "Kelola link produk, prompt, kategori, user, dan analytics.",
    path: "/superadmin",
    icon: ShieldCheck,
    tone: "violet",
  },
  {
    label: "User Access",
    description: "Buka semua prompt premium, cheat sheet, kategori, dan copy workflow.",
    path: "/library",
    icon: UserRoundCheck,
    tone: "mint",
  },
];

export function SupabaseLoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const reason = searchParams.get("reason");
  const initialRedirectPath = nextPath?.startsWith("/") ? nextPath : "/library";
  const initialMessage =
    reason === "auth-required"
      ? "Silakan login dulu untuk membuka halaman tersebut."
      : reason === "missing-supabase-config"
        ? "Supabase belum dikonfigurasi. Isi .env.local sebelum membuka halaman member."
        : "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirectPath, setRedirectPath] = useState(initialRedirectPath);
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

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!isSupabaseConfigured || !supabase) {
      setMessage("Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local.");
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
    router.push(redirectPath);
    router.refresh();
  }

  async function handleOAuthLogin(provider: "google" | "github") {
    setMessage("");

    if (!isSupabaseConfigured || !supabase) {
      setMessage("Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local.");
      return;
    }

    setStatus("loading");

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      },
    });

    if (error) {
      setStatus("idle");
      setMessage(error.message);
    }
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setMessage("Session sudah keluar.");
  }

  return (
    <div className="rounded-[28px] bg-[var(--color-arctic-mist)] p-6 md:p-8">
      <Stagger className="grid gap-4 md:grid-cols-2">
        {roleOptions.map((role) => {
          const Icon = role.icon;
          const isSelected = redirectPath === role.path;

          return (
            <StaggerItem key={role.label}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setRedirectPath(role.path)}
                className={`login-role-card text-left ${isSelected ? "selected" : ""}`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    role.tone === "violet"
                      ? "bg-[var(--color-whisper-fade-violet)] text-[var(--color-deep-violet)]"
                      : "bg-[var(--color-mint-glaze)] text-[var(--color-electric-blue)]"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2>{role.label}</h2>
                <p>{role.description}</p>
                <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-electric-blue)]">
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Tujuan login dipilih
                    </>
                  ) : (
                    <>
                      Pilih tujuan login
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </span>
              </motion.button>
            </StaggerItem>
          );
        })}
      </Stagger>

      <FadeIn className="mt-6 rounded-[24px] border border-white bg-white/80 p-5" delay={0.16}>
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
                className="primary-button flex-1"
                type="button"
                onClick={() => router.push(redirectPath)}
              >
                Lanjutkan
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button className="secondary-button flex-1" type="button" onClick={handleLogout}>
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
                placeholder="Password Supabase Auth"
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
              {status === "loading" ? "Memeriksa akun..." : "Login dengan Supabase"}
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[rgba(83,88,98,0.14)]"></div>
              </div>
              <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-ash-gray)]">
                atau masuk lewat
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                disabled={status === "loading"}
                className="secondary-button justify-center font-semibold"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin("github")}
                disabled={status === "loading"}
                className="secondary-button justify-center font-semibold"
              >
                GitHub
              </button>
            </div>
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
