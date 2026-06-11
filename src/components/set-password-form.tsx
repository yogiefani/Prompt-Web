"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function SetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"checking" | "idle" | "loading" | "success" | "error">("checking");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (!supabase) {
      Promise.resolve().then(() => {
        setStatus("error");
        setMessage("Layanan database belum dikonfigurasi.");
      });
      return;
    }

    // Periksa apakah user memiliki sesi aktif (karena mengeklik link undangan)
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        setStatus("error");
        setMessage("Tautan aktivasi tidak valid, telah kedaluwarsa, atau sesi login tidak ditemukan. Silakan masuk melalui halaman login.");
      } else {
        setUserEmail(user.email ?? "");
        setStatus("idle");
      }
    });
  }, []);

  async function handleSetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Password dan konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password minimal harus terdiri dari 6 karakter.");
      return;
    }

    if (!supabase) return;

    setStatus("loading");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setStatus("idle");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Password berhasil disetel! Mengalihkan ke pustaka prompt...");

    // Berikan jeda 1.5 detik untuk animasi sukses
    window.setTimeout(() => {
      router.push("/library");
      router.refresh();
    }, 1500);
  }

  if (status === "checking") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-electric-blue)]" aria-hidden="true" />
        <p className="mt-4 text-sm font-semibold text-[var(--color-silver-pine)]">Memeriksa tautan aktivasi...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-5 p-6 text-center md:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-whisper-fade-orange)] text-[var(--color-zesty-orange)]">
          <KeyRound className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="font-aeonik text-xl tracking-[-0.02em] text-[var(--color-obsidian)]">Aktivasi Gagal</h2>
        <p className="text-sm font-medium leading-6 text-[var(--color-silver-pine)]">{message}</p>
        <button
          onClick={() => router.push("/login")}
          className="secondary-button w-full justify-center mt-2"
          type="button"
        >
          Kembali ke Halaman Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="text-left">
        <span className="rounded-full bg-[var(--color-mint-glaze)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-silver-pine)] shadow-sm">
          Aktivasi Akun Baru
        </span>
        <h2 className="mt-4 font-aeonik text-2xl tracking-[-0.02em] text-[var(--color-obsidian)]">
          Buat Password Akun Anda
        </h2>
        {userEmail && (
          <p className="mt-2 text-xs font-semibold text-[var(--color-silver-pine)]">
            Mengaktifkan akses untuk: <span className="text-[var(--color-obsidian)] font-bold">{userEmail}</span>
          </p>
        )}
      </div>

      <form className="space-y-4 text-left" onSubmit={handleSetPassword}>
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]" htmlFor="password">
            Password Baru
          </label>
          <input
            id="password"
            className="form-input mt-2"
            placeholder="Minimal 6 karakter"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={status === "loading" || status === "success"}
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]" htmlFor="confirmPassword">
            Konfirmasi Password
          </label>
          <input
            id="confirmPassword"
            className="form-input mt-2"
            placeholder="Ulangi password baru"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={status === "loading" || status === "success"}
            required
          />
        </div>

        {message ? (
          <p
            className={`rounded-2xl px-4 py-3 text-sm font-semibold leading-6 ${
              status === "success"
                ? "bg-[var(--color-mint-glaze)] text-[var(--color-silver-pine)]"
                : "bg-[var(--color-whisper-fade-yellow)] text-[var(--color-silver-pine)]"
            }`}
          >
            {message}
          </p>
        ) : null}

        <button
          className="primary-button w-full justify-center"
          type="submit"
          disabled={status === "loading" || status === "success"}
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : status === "success" ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          )}
          {status === "loading"
            ? "Menyimpan password..."
            : status === "success"
            ? "Berhasil Diaktifkan"
            : "Aktifkan Akun Saya"}
        </button>
      </form>
    </div>
  );
}
