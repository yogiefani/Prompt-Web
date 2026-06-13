"use client";

import { FormEvent, useMemo, useState } from "react";
import { Loader2, Search, Send, ShieldCheck, Trash2, Mail } from "lucide-react";
import type { AccessGrantView } from "@/lib/prompt-data";

type AccessManagerProps = {
  source: "supabase" | "fallback";
  initialGrants: AccessGrantView[];
};

export function AccessManager({ source, initialGrants }: AccessManagerProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [provider, setProvider] = useState("manual");
  const [productId, setProductId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [message, setMessage] = useState("");

  const [grants, setGrants] = useState<AccessGrantView[]>(initialGrants);
  const [searchQuery, setSearchQuery] = useState("");
  const [revokingId, setRevokingId] = useState("");
  const [sendingInviteEmail, setSendingInviteEmail] = useState("");

  // Filter daftar grants berdasarkan input pencarian
  const filteredGrants = useMemo(() => {
    return grants.filter((grant) => {
      const haystack = `${grant.email} ${grant.fullName} ${grant.provider} ${grant.productId}`.toLowerCase();
      return haystack.includes(searchQuery.toLowerCase());
    });
  }, [grants, searchQuery]);

  async function grantAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/access/grant", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          fullName: fullName.trim(),
          provider,
          productId: productId.trim(),
          metadata: {
            source: "superadmin-ui",
          },
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        ok?: boolean;
        status?: string;
        email?: string;
        userId?: string;
      };
      
      setStatus("idle");

      if (!response.ok) {
        setMessage(result.error ?? "Gagal memberikan akses.");
        return;
      }

      setMessage(`Akses ${result.status === "invited" ? "undangan dikirim" : "aktif"} untuk ${result.email ?? email}.`);
      
      // Tambahkan item baru ke dalam list state secara lokal agar langsung tampil
      const newGrant: AccessGrantView = {
        id: Math.random().toString(36).substring(7), // dummy id jika DB sukses terupdate, kita refresh via server action juga jika bisa
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        provider,
        productId: productId.trim(),
        status: result.status ?? "granted",
        createdAt: new Date().toISOString(),
        userId: result.userId ?? "",
      };

      setGrants((prev) => [newGrant, ...prev]);

      setEmail("");
      setFullName("");
      setProductId("");
    } catch {
      setStatus("idle");
      setMessage("Terjadi kesalahan jaringan.");
    }
  }

  async function revokeAccess(grantId: string, memberEmail: string, memberUserId: string) {
    const confirmed = window.confirm(`Apakah Anda yakin ingin mencabut semua hak akses untuk "${memberEmail}"?\nAkun user di database login juga akan dihapus.`);
    if (!confirmed) return;

    setRevokingId(grantId);
    setMessage("");

    try {
      const response = await fetch("/api/access/revoke", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          grantId,
          email: memberEmail,
          userId: memberUserId,
        }),
      });

      const result = (await response.json()) as { error?: string; ok?: boolean };
      setRevokingId("");

      if (!response.ok) {
        setMessage(result.error ?? "Gagal mencabut akses.");
        return;
      }

      setMessage(`Akses untuk ${memberEmail} berhasil dicabut.`);
      // Hapus dari state lokal
      setGrants((prev) => prev.filter((g) => g.id !== grantId));
    } catch {
      setRevokingId("");
      setMessage("Terjadi kesalahan jaringan saat mencabut akses.");
    }
  }

  async function resendInvite(memberEmail: string, fullName: string, provider: string, productId: string) {
    setSendingInviteEmail(memberEmail);
    setMessage("");

    try {
      const response = await fetch("/api/access/invite/resend", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: memberEmail,
          fullName,
          provider,
          productId,
        }),
      });

      const result = (await response.json()) as { error?: string; ok?: boolean };
      setSendingInviteEmail("");

      if (!response.ok) {
        setMessage(result.error ?? "Gagal mengirim ulang undangan.");
        return;
      }

      setMessage(`Undangan aktivasi berhasil dikirim ulang ke ${memberEmail}.`);
    } catch {
      setSendingInviteEmail("");
      setMessage("Terjadi kesalahan jaringan saat mengirim ulang undangan.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Kartu Form Input Grant Access */}
      <section className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8 border border-white/50">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-mint-glaze)] text-[var(--color-electric-blue)] shadow-sm">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-aeonik text-2xl tracking-[-0.02em] text-[var(--color-obsidian)]">Berikan Akses Baru</h3>
              <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-[var(--color-silver-pine)]">
                Daftarkan member baru secara manual. Sistem akan mengirim undangan aktivasi via email jika alamat belum terdaftar.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-[var(--color-sky-wash)] px-4 py-2 text-xs font-semibold text-[var(--color-electric-blue)]">
            {source === "supabase" ? "Sistem Aktif" : "Mode Simulasi"}
          </span>
        </div>

        <form className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto]" onSubmit={grantAccess}>
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]">
            Email Pembeli
            <input
              className="form-input mt-2"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              required
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]">
            Nama Lengkap
            <input
              className="form-input mt-2"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Nama Lengkap"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]">
            Provider Pembayaran
            <select
              className="form-input mt-2 bg-white"
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
            >
              <option value="manual">Manual</option>
              <option value="stripe">Stripe</option>
              <option value="lemon-squeezy">Lemon Squeezy</option>
              <option value="webhook">Webhook API</option>
            </select>
          </label>
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]">
            Product ID
            <input
              className="form-input mt-2"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              placeholder="Kunci Produk (cth: prod_premium)"
            />
          </label>
          <button className="primary-button mt-6 min-h-[42px] px-6" type="submit" disabled={status === "loading"}>
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            Grant Access
          </button>
        </form>

        {message ? (
          <p className="mt-4 rounded-2xl bg-[var(--color-whisper-fade-yellow)] px-4 py-3 text-sm font-semibold leading-6 text-[var(--color-silver-pine)]">
            {message}
          </p>
        ) : null}
      </section>

      {/* Tabel & Pencarian Member */}
      <section className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8 border border-white/50 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-aeonik text-2xl tracking-[-0.02em] text-[var(--color-obsidian)]">Daftar Member Aktif</h3>
            <p className="mt-1 text-sm font-medium text-[var(--color-silver-pine)]">
              Total terdaftar: <span className="font-bold text-[var(--color-obsidian)]">{grants.length} member</span>
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 rounded-full border border-[rgba(83,88,98,0.16)] bg-[var(--color-arctic-mist)] px-4 py-2.5 min-w-72">
            <Search className="h-4 w-4 text-[var(--color-silver-pine)]" aria-hidden="true" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari email, nama, atau provider..."
              className="w-full bg-transparent text-xs font-semibold text-[var(--color-obsidian)] outline-none placeholder:text-[var(--color-ash-gray)]"
            />
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto rounded-2xl border border-[rgba(83,88,98,0.12)]">
          <table className="w-full text-left text-xs font-medium text-[var(--color-silver-pine)]">
            <thead className="bg-[var(--color-whisper-fade-blue)] text-[var(--color-obsidian)] border-b border-[rgba(83,88,98,0.12)]">
              <tr>
                <th className="p-4 font-bold">Email Pembeli</th>
                <th className="p-4 font-bold">Nama</th>
                <th className="p-4 font-bold">Provider</th>
                <th className="p-4 font-bold">Product ID</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Tanggal Diberikan</th>
                <th className="p-4 text-center font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrants.map((grant) => (
                <tr key={grant.id} className="border-t border-[rgba(83,88,98,0.08)] hover:bg-[var(--color-arctic-mist)]/50 transition">
                  <td className="p-4 font-semibold text-[var(--color-obsidian)] break-all">{grant.email}</td>
                  <td className="p-4 font-semibold text-[var(--color-obsidian)]">{grant.fullName || "-"}</td>
                  <td className="p-4 capitalize">
                    <span className="rounded-md bg-gray-100 px-2 py-1 font-semibold text-gray-700">
                      {grant.provider}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-gray-600">{grant.productId || "-"}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        grant.status === "invited"
                          ? "bg-[var(--color-whisper-fade-violet)] text-[var(--color-deep-violet)]"
                          : "bg-[var(--color-mint-glaze)] text-[var(--color-silver-pine)]"
                      }`}
                    >
                      {grant.status === "invited" ? "✉️ Undangan Terkirim" : "✅ Akses Aktif"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(grant.createdAt))}
                  </td>
                  <td className="p-4 text-center whitespace-nowrap">
                    {grant.status === "invited" && (
                      <button
                        onClick={() => resendInvite(grant.email, grant.fullName, grant.provider, grant.productId)}
                        disabled={sendingInviteEmail === grant.email}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-violet-100 text-violet-500 hover:bg-violet-50 transition mr-2"
                        type="button"
                        title="Kirim ulang undangan aktivasi"
                      >
                        {sendingInviteEmail === grant.email ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => revokeAccess(grant.id, grant.email, grant.userId)}
                      disabled={revokingId === grant.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition"
                      type="button"
                      title="Cabut Akses Member"
                    >
                      {revokingId === grant.id ? (
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredGrants.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-[var(--color-silver-pine)] bg-[var(--color-arctic-mist)]">
              {searchQuery ? "Tidak ada member yang cocok dengan pencarian." : "Belum ada member terdaftar."}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
