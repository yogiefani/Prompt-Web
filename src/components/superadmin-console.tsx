"use client";

import { useState } from "react";
import { ExternalLink, Link2, Loader2, Save, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminTasks, brand } from "@/lib/content";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type SuperadminConsoleProps = {
  initialBrandName?: string;
  initialProductUrl?: string;
  initialSupportEmail?: string;
  source?: "supabase" | "fallback";
};

export function SuperadminConsole({
  initialBrandName = brand.name,
  initialProductUrl = brand.productUrl,
  initialSupportEmail = brand.supportEmail,
  source = "fallback",
}: SuperadminConsoleProps) {
  const router = useRouter();
  const [brandName, setBrandName] = useState(initialBrandName);
  const [productUrl, setProductUrl] = useState(initialProductUrl);
  const [supportEmail, setSupportEmail] = useState(initialSupportEmail);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [message, setMessage] = useState("");

  const isReady = isSupabaseConfigured && source === "supabase" && Boolean(supabase);

  async function saveSettings() {
    setMessage("");

    if (!isReady || !supabase) {
      setMessage("Gagal menyimpan: Konfigurasi sistem database belum siap.");
      return;
    }

    setStatus("loading");

    const { error } = await supabase.from("site_settings").upsert({
      id: true,
      brand_name: brandName.trim() || brand.name,
      product_url: productUrl.trim(),
      support_email: supportEmail.trim(),
      updated_at: new Date().toISOString(),
    });

    setStatus("idle");

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Setting publik berhasil disimpan.");
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)]">
            <Link2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-aeonik text-2xl tracking-[-0.02em] text-[var(--color-obsidian)]">
              Public Settings
            </h2>
            <p className="mt-1 text-sm font-medium text-[var(--color-silver-pine)]">
              Brand, support email, dan tombol registrasi publik dibaca dari database.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-[var(--color-obsidian)]">
            Nama brand
            <input
              value={brandName}
              onChange={(event) => setBrandName(event.target.value)}
              className="form-input mt-2"
            />
          </label>
          <label className="block text-sm font-semibold text-[var(--color-obsidian)]">
            Support email
            <input
              value={supportEmail}
              onChange={(event) => setSupportEmail(event.target.value)}
              className="form-input mt-2"
              type="email"
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-semibold text-[var(--color-obsidian)]">
          URL produk digital
          <input
            value={productUrl}
            onChange={(event) => setProductUrl(event.target.value)}
            className="form-input mt-2"
            type="url"
          />
        </label>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <button className="primary-button" type="button" onClick={saveSettings} disabled={status === "loading"}>
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            Save Settings
          </button>
          <span className="rounded-full bg-[var(--color-sky-wash)] px-4 py-2 text-xs font-semibold text-[var(--color-electric-blue)]">
            {isReady ? "Koneksi Sistem Aktif" : "Konfigurasi Diperlukan"}
          </span>
        </div>

        {message ? (
          <p className="mt-4 rounded-2xl bg-[var(--color-whisper-fade-yellow)] px-4 py-3 text-sm font-semibold leading-6 text-[var(--color-silver-pine)]">
            {message}
          </p>
        ) : null}

        <a
          href={productUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-electric-blue)]"
        >
          Preview destination
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </section>

      <section className="rounded-[32px] bg-[var(--color-arctic-mist)] p-6 shadow-[var(--shadow-lg)] md:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-mint-glaze)] text-[var(--color-electric-blue)]">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-aeonik text-2xl tracking-[-0.02em] text-[var(--color-obsidian)]">
              Role Rules
            </h2>
            <p className="mt-1 text-sm font-medium text-[var(--color-silver-pine)]">
              Superadmin mengelola konten, user access hanya membaca dan memakai prompt.
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-3">
          {adminTasks.map((task) => (
            <li
              key={task}
              className="rounded-2xl border border-white bg-white/70 px-4 py-3 text-sm font-medium leading-6 text-[var(--color-silver-pine)]"
            >
              {task}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
