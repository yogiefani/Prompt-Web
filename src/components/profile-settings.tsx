"use client";

import { FormEvent, useEffect, useState } from "react";
import { KeyRound, Loader2, CheckCircle2, AlertCircle, User, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function ProfileSettings() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    // Ambil data user yang sedang login
    client.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? "");
        setFullName(user.user_metadata?.full_name ?? "Member");
        
        // Ambil data profile untuk periksa role
        client
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setRole(data.role);
            }
          });
      }
    });
  }, []);

  async function handleUpdatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Password baru dan konfirmasi tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage("Password minimal harus terdiri dari 6 karakter.");
      return;
    }

    if (!supabase) return;

    setStatus("loading");

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Password berhasil diperbarui!");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Kartu Informasi Profil */}
      <div className="rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-lg)] md:p-8 flex flex-col justify-between">
        <div>
          <span className="rounded-full bg-[var(--color-whisper-fade-blue)] px-4 py-2 text-xs font-semibold text-[var(--color-electric-blue)]">
            Detail Akun
          </span>
          <h2 className="mt-5 font-aeonik text-3xl tracking-[-0.02em] text-[var(--color-obsidian)]">
            Informasi Profil Anda
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-[var(--color-silver-pine)]">
            Berikut adalah detail akun Anda yang terdaftar di PromptVault OS.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex items-center gap-4 border-b border-[rgba(83,88,98,0.12)] pb-4 dark:border-white/10">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-arctic-mist)] text-[var(--color-silver-pine)] dark:bg-white/5">
                <User className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]">Nama Lengkap</p>
                <p className="text-sm font-semibold text-[var(--color-obsidian)]">{fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-b border-[rgba(83,88,98,0.12)] pb-4 dark:border-white/10">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-arctic-mist)] text-[var(--color-silver-pine)] dark:bg-white/5">
                <KeyRound className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]">Email Keanggotaan</p>
                <p className="text-sm font-semibold text-[var(--color-obsidian)]">{email || "Memuat email..."}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pb-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-arctic-mist)] text-[var(--color-silver-pine)] dark:bg-white/5">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]">Tipe Akses</p>
                <div className="mt-1 flex items-center">
                  {role === "superadmin" ? (
                    <span className="rounded-full bg-purple-100 dark:bg-purple-950/40 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                      Superadmin
                    </span>
                  ) : (
                    <span className="rounded-full bg-[var(--color-mint-glaze)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-silver-pine)]">
                      Premium Member
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[rgba(83,88,98,0.12)] dark:border-white/10 pt-5 text-xs font-semibold text-[var(--color-silver-pine)]">
          Akses Anda aktif seumur hidup. Hubungi admin jika membutuhkan bantuan keanggotaan.
        </div>
      </div>

      {/* Kartu Form Ubah Password */}
      <div className="rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-lg)] md:p-8">
        <span className="rounded-full bg-[var(--color-whisper-fade-orange)] px-4 py-2 text-xs font-semibold text-[var(--color-zesty-orange)]">
          Keamanan Akun
        </span>
        <h2 className="mt-5 font-aeonik text-3xl tracking-[-0.02em] text-[var(--color-obsidian)]">
          Ubah Password
        </h2>
        <p className="mt-3 text-sm font-medium leading-6 text-[var(--color-silver-pine)]">
          Masukkan password baru Anda di bawah ini untuk mengganti password bawaan.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleUpdatePassword}>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]" htmlFor="profile-password">
              Password Baru
            </label>
            <input
              id="profile-password"
              className="form-input mt-2"
              placeholder="Minimal 6 karakter"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={status === "loading"}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]" htmlFor="profile-confirmPassword">
              Konfirmasi Password Baru
            </label>
            <input
              id="profile-confirmPassword"
              className="form-input mt-2"
              placeholder="Ulangi password baru"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={status === "loading"}
              required
            />
          </div>

          {message && (
            <div
              className={`flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-sm font-semibold leading-6 ${
                status === "success"
                  ? "bg-[var(--color-mint-glaze)] text-[var(--color-silver-pine)]"
                  : "bg-[var(--color-whisper-fade-yellow)] text-[var(--color-silver-pine)]"
              }`}
            >
              {status === "success" ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-[var(--color-zesty-orange)]" />
              )}
              <span>{message}</span>
            </div>
          )}

          <button
            className="primary-button w-full justify-center mt-6"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <KeyRound className="h-4 w-4" aria-hidden="true" />
            )}
            {status === "loading" ? "Memperbarui..." : "Perbarui Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
