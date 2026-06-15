"use client";

import { useState } from "react";
import { Megaphone, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FadeIn } from "@/components/motion-primitives";

export function NotificationBlastManager() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"system" | "announcement">("announcement");
  const [linkUrl, setLinkUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [sentCount, setSentCount] = useState(0);

  async function handleBlast(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    setStatus("loading");
    setStatusMessage("Mengambil daftar user...");

    try {
      // Get all active users
      const { data: users, error: userError } = await supabase
        .from("profiles")
        .select("id");

      if (userError) throw userError;
      if (!users || users.length === 0) {
        setStatus("error");
        setStatusMessage("Tidak ada user ditemukan untuk menerima notifikasi.");
        return;
      }

      setStatusMessage(`Menyiapkan pengiriman ke ${users.length} user...`);

      // Prepare bulk insert payload
      const payload = users.map((u) => ({
        user_id: u.id,
        title,
        message,
        type,
        link_url: linkUrl || null,
        is_read: false
      }));

      const { error: insertError } = await supabase
        .from("notifications")
        .insert(payload);

      if (insertError) throw insertError;

      setStatus("success");
      setSentCount(users.length);
      setStatusMessage(`Berhasil mengirim blast notifikasi ke ${users.length} member!`);
      
      // Reset form
      setTitle("");
      setMessage("");
      setLinkUrl("");
      
      // Reset status after a few seconds
      setTimeout(() => setStatus("idle"), 5000);
      
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setStatusMessage("Terjadi kesalahan: " + (err.message || "Gagal mengirim blast"));
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <FadeIn className="rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 md:p-8 shadow-[var(--shadow-lg)] border border-[rgba(83,88,98,0.06)] dark:border-white/10">
        <div className="mb-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-900/30">
            <Megaphone className="h-6 w-6" />
          </div>
          <h2 className="font-aeonik text-2xl text-[var(--color-obsidian)]">Kirim Blast Notifikasi</h2>
          <p className="mt-2 text-sm text-[var(--color-silver-pine)]">
            Kirim pengumuman massal ke seluruh member aktif. Notifikasi akan langsung muncul di ikon lonceng mereka.
          </p>
        </div>

        <form onSubmit={handleBlast} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ash-gray)]">
              Tipe Notifikasi
            </label>
            <div className="mt-2 flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[rgba(83,88,98,0.12)] p-3 text-sm font-semibold transition-all hover:bg-[var(--color-arctic-mist)] has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50 has-[:checked]:text-purple-700 dark:has-[:checked]:bg-purple-900/20 dark:has-[:checked]:text-purple-300">
                <input
                  type="radio"
                  name="type"
                  value="announcement"
                  checked={type === "announcement"}
                  onChange={(e) => setType(e.target.value as any)}
                  className="hidden"
                />
                <Megaphone className="h-4 w-4" /> Pengumuman
              </label>
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[rgba(83,88,98,0.12)] p-3 text-sm font-semibold transition-all hover:bg-[var(--color-arctic-mist)] has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700 dark:has-[:checked]:bg-blue-900/20 dark:has-[:checked]:text-blue-300">
                <input
                  type="radio"
                  name="type"
                  value="system"
                  checked={type === "system"}
                  onChange={(e) => setType(e.target.value as any)}
                  className="hidden"
                />
                <AlertCircle className="h-4 w-4" /> Info Sistem
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ash-gray)]">Judul</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input mt-2 bg-[var(--color-arctic-mist)]"
              placeholder="Contoh: Fitur Prompt Studio Baru!"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ash-gray)]">Pesan Detail</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="admin-textarea mt-2 min-h-[120px] bg-[var(--color-arctic-mist)]"
              placeholder="Jelaskan detail pengumuman yang ingin disampaikan..."
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ash-gray)]">URL Tujuan (Opsional)</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="form-input mt-2 bg-[var(--color-arctic-mist)] text-xs"
              placeholder="https://... (Jika member klik notif, akan diarahkan ke link ini)"
            />
          </div>

          {statusMessage && (
            <div className={`rounded-xl p-4 text-sm font-medium ${
              status === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
              status === "error" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
              "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            }`}>
              <div className="flex items-start gap-2">
                {status === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                <p>{statusMessage}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="primary-button w-full justify-center bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 py-3"
          >
            <Send className="mr-2 h-4 w-4" />
            {status === "loading" ? "Memproses Blast..." : "Kirim Blast Notifikasi"}
          </button>
        </form>
      </FadeIn>

      <FadeIn className="rounded-[32px] bg-[var(--color-arctic-mist)] border border-[rgba(83,88,98,0.06)] p-6 md:p-8 dark:bg-[var(--color-canvas-white)]/50 dark:border-white/5">
        <h3 className="font-aeonik text-lg text-[var(--color-obsidian)]">Preview Notifikasi</h3>
        <p className="mt-1 text-xs text-[var(--color-silver-pine)]">Beginilah tampilan notifikasi di layar member.</p>
        
        <div className="mt-6 rounded-2xl bg-white dark:bg-[var(--color-canvas-white)] shadow-sm border border-[rgba(83,88,98,0.08)] p-4 flex gap-4">
          <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            type === "announcement" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          }`}>
            {type === "announcement" ? <Megaphone className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--color-obsidian)]">
              {title || "Judul Pengumuman"}
            </h4>
            <p className="mt-1 text-xs font-medium text-[var(--color-silver-pine)] line-clamp-2">
              {message || "Detail pesan yang ingin Anda sampaikan ke seluruh member akan muncul di sini."}
            </p>
            {linkUrl && (
              <span className="mt-2 inline-flex text-[10px] font-bold text-blue-500">
                🔗 Tautan terlampir
              </span>
            )}
            <span className="mt-2 block text-[10px] font-bold text-[var(--color-ash-gray)]">
              Baru saja
            </span>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
