"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send, ShieldCheck } from "lucide-react";

type AccessManagerProps = {
  source: "supabase" | "fallback";
};

export function AccessManager({ source }: AccessManagerProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [provider, setProvider] = useState("manual");
  const [productId, setProductId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [message, setMessage] = useState("");

  async function grantAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/access/grant", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        fullName,
        provider,
        productId,
        metadata: {
          source: "superadmin-ui",
        },
      }),
    });

    const result = (await response.json()) as { error?: string; status?: string; email?: string };
    setStatus("idle");

    if (!response.ok) {
      setMessage(result.error ?? "Gagal memberikan akses.");
      return;
    }

    setMessage(`Akses ${result.status ?? "granted"} untuk ${result.email ?? email}.`);
    setEmail("");
    setFullName("");
    setProductId("");
  }

  return (
    <section className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-mint-glaze)] text-[var(--color-electric-blue)]">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-aeonik text-2xl tracking-[-0.02em]">Access Manager</h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[var(--color-silver-pine)]">
              Berikan akses member dari pembelian produk. Jika email belum terdaftar, sistem akan mengirimkan undangan aktivasi via email.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[var(--color-sky-wash)] px-4 py-2 text-xs font-semibold text-[var(--color-electric-blue)]">
          {source === "supabase" ? "Sistem Aktif" : "Konfigurasi Diperlukan"}
        </span>
      </div>

      <form className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_0.75fr_0.75fr_auto]" onSubmit={grantAccess}>
        <label className="block text-sm font-semibold">
          Email pembeli
          <input
            className="form-input mt-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-semibold">
          Nama
          <input
            className="form-input mt-2"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </label>
        <label className="block text-sm font-semibold">
          Provider
          <input
            className="form-input mt-2"
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
          />
        </label>
        <label className="block text-sm font-semibold">
          Product ID
          <input
            className="form-input mt-2"
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
          />
        </label>
        <button className="primary-button mt-7" type="submit" disabled={status === "loading"}>
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
          Grant
        </button>
      </form>

      {message ? (
        <p className="mt-4 rounded-2xl bg-[var(--color-whisper-fade-yellow)] px-4 py-3 text-sm font-semibold leading-6 text-[var(--color-silver-pine)]">
          {message}
        </p>
      ) : null}
    </section>
  );
}
