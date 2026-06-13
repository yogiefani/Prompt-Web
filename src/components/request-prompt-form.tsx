"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Plus, Send, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type RequestPromptFormProps = {
  source: "supabase" | "fallback";
};

export function RequestPromptForm({ source }: RequestPromptFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetModel, setTargetModel] = useState("All AI");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  async function fetchMyRequests() {
    if (source !== "supabase" || !supabase) return;
    setLoadingRequests(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("prompt_requests")
          .select("id, title, description, target_model, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setMyRequests(data);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil riwayat request:", err);
    } finally {
      setLoadingRequests(false);
    }
  }

  // Fetch riwayat ketika form dibuka
  useState(() => {
    if (isOpen) {
      fetchMyRequests();
    }
  });

  // Re-run fetch saat status open berubah
  const previousOpen = isOpen;
  if (isOpen && !previousOpen) {
    fetchMyRequests();
  }


  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (source !== "supabase" || !supabase) {
      setStatus("error");
      setMessage("Layanan pengiriman sedang tidak aktif. Silakan hubungi admin atau coba lagi nanti.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setStatus("error");
      setMessage("Sesi login tidak ditemukan. Silakan login ulang.");
      return;
    }

    const { error } = await supabase.from("prompt_requests").insert({
      user_id: user.id,
      title,
      description,
      target_model: targetModel,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Request terkirim ke superadmin.");
    setTitle("");
    setTargetModel("All AI");
    setDescription("");
    fetchMyRequests();
  }

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen((current) => !current)}
        className="primary-button"
        type="button"
      >
        {isOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
        Request Prompt
      </motion.button>

      <AnimatePresence>
        {isOpen ? (
          <motion.form
            onSubmit={handleSubmit}
            className="absolute right-0 top-14 z-20 w-[min(92vw,420px)] space-y-4 rounded-[28px] border border-[rgba(83,88,98,0.14)] bg-white p-5 text-left shadow-[var(--shadow-lg)] max-h-[85vh] overflow-y-auto no-scrollbar"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-ash-gray)]" htmlFor="request-title">
                Judul request
              </label>
              <input
                id="request-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="form-input mt-2"
                placeholder="Prompt untuk campaign launch"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-ash-gray)]" htmlFor="request-model">
                Target AI
              </label>
              <input
                id="request-model"
                value={targetModel}
                onChange={(event) => setTargetModel(event.target.value)}
                className="form-input mt-2"
                placeholder="ChatGPT, Claude, Gemini, Midjourney..."
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-ash-gray)]" htmlFor="request-description">
                Detail kebutuhan
              </label>
              <textarea
                id="request-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="admin-textarea mt-2 min-h-32"
                placeholder="Jelaskan output yang kamu butuhkan, konteks bisnis, dan contoh hasil ideal."
                required
              />
            </div>

            {message ? (
              <p
                className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                  status === "success"
                    ? "bg-[var(--color-mint-glaze)] text-[var(--color-silver-pine)]"
                    : "bg-[var(--color-whisper-fade-orange)] text-[var(--color-zesty-orange)]"
                }`}
              >
                {message}
              </p>
            ) : null}

            <button className="primary-button w-full" type="submit" disabled={status === "loading"}>
              {status === "success" ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              {status === "loading" ? "Mengirim..." : "Kirim Request"}
            </button>

            {source === "supabase" && (
              <div className="border-t border-[rgba(83,88,98,0.12)] pt-4 mt-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)] mb-2">
                  Riwayat Request Anda ({myRequests.length}):
                </p>
                {loadingRequests ? (
                  <p className="text-xs font-semibold text-[var(--color-silver-pine)]">Memuat riwayat...</p>
                ) : myRequests.length === 0 ? (
                  <p className="text-xs font-medium text-[var(--color-ash-gray)]">Belum ada request sebelumnya.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    {myRequests.map((req) => (
                      <div key={req.id} className="rounded-xl bg-[var(--color-sky-wash)]/40 p-2.5 border border-[rgba(83,88,98,0.06)]">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-[var(--color-obsidian)] truncate">{req.title}</h4>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.02em] whitespace-nowrap ${
                            req.status === "pending" ? "bg-[var(--color-whisper-fade-orange)] text-[var(--color-zesty-orange)]" :
                            req.status === "approved" || req.status === "done" ? "bg-[var(--color-mint-glaze)] text-[var(--color-silver-pine)]" :
                            "bg-gray-100 text-[var(--color-silver-pine)]"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-[var(--color-silver-pine)] line-clamp-2 leading-relaxed">{req.description}</p>
                        <span className="mt-1 block text-[9px] text-[var(--color-ash-gray)]">Target: {req.target_model || "All AI"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.form>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
