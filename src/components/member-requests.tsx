"use client";

import { FormEvent, useState, useEffect } from "react";
import { CheckCircle2, MessageSquarePlus, Send, History, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FadeIn, LiftCard, Stagger } from "@/components/motion-primitives";

type MemberRequestsProps = {
  source: "supabase" | "fallback";
};

export function MemberRequests({ source }: MemberRequestsProps) {
  const [title, setTitle] = useState("");
  const [targetModel, setTargetModel] = useState("All AI");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  async function fetchMyRequests() {
    if (source !== "supabase" || !supabase) {
      setLoadingRequests(false);
      return;
    }
    
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

  useEffect(() => {
    fetchMyRequests();
  }, [source]);

  const pendingCount = myRequests.filter((req) => req.status === "pending").length;
  const isLimitReached = pendingCount >= 3;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (source !== "supabase" || !supabase) {
      setStatus("error");
      setMessage("Layanan pengiriman sedang tidak aktif. Silakan hubungi admin atau coba lagi nanti.");
      return;
    }

    if (isLimitReached) {
      setStatus("error");
      setMessage("Anda memiliki terlalu banyak request yang masih diproses. Harap tunggu.");
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
    } else {
      setStatus("success");
      setMessage("Request Anda telah berhasil dikirim dan masuk ke antrean Superadmin.");
      setTitle("");
      setTargetModel("All AI");
      setDescription("");
      fetchMyRequests();
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      {/* Kiri: Form Request */}
      <FadeIn className="flex flex-col gap-6">
        <div className="rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-lg)] md:p-8">
          <div className="mb-8">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)]">
              <MessageSquarePlus className="h-6 w-6" />
            </div>
            <h2 className="font-aeonik text-3xl tracking-[-0.02em] text-[var(--color-obsidian)]">
              Kirim Request Prompt
            </h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--color-silver-pine)] max-w-xl">
              Punya ide workflow atau butuh prompt AI spesifik yang belum ada di library? 
              Ceritakan kebutuhanmu secara detail, tim ahli kami akan membuatkannya untukmu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-ash-gray)]" htmlFor="request-title">
                Judul Request
              </label>
              <input
                id="request-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="form-input bg-[var(--color-arctic-mist)] text-sm py-3"
                placeholder="Contoh: Prompt untuk membalas email komplain pelanggan"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-ash-gray)]" htmlFor="request-model">
                Target Model AI
              </label>
              <input
                id="request-model"
                value={targetModel}
                onChange={(event) => setTargetModel(event.target.value)}
                className="form-input bg-[var(--color-arctic-mist)] text-sm py-3"
                placeholder="Semua AI, ChatGPT 4, Claude 3, Midjourney, dll."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-ash-gray)]" htmlFor="request-description">
                Detail Kebutuhan / Konteks
              </label>
              <textarea
                id="request-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="admin-textarea bg-[var(--color-arctic-mist)] text-sm min-h-[160px] resize-y"
                placeholder="Jelaskan workflow bisnismu, seperti apa format output yang diinginkan (tabel, poin-poin, tone suara), dan berikan contoh hasil ideal jika ada."
                required
              />
            </div>

            {message ? (
              <div
                className={`rounded-2xl border p-4 ${
                  status === "success"
                    ? "border-[rgba(5,150,105,0.15)] bg-[var(--color-mint-glaze)] text-[var(--color-silver-pine)]"
                    : "border-[rgba(242,97,16,0.15)] bg-[var(--color-whisper-fade-orange)] text-[var(--color-zesty-orange)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  {status === "success" ? <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" /> : <Clock className="h-5 w-5 mt-0.5 shrink-0" />}
                  <p className="text-sm font-semibold leading-relaxed">{message}</p>
                </div>
              </div>
            ) : null}

            {isLimitReached ? (
              <div className="rounded-2xl border border-[rgba(242,97,16,0.15)] bg-[var(--color-whisper-fade-orange)] p-5">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 mt-0.5 shrink-0 text-[var(--color-zesty-orange)]" />
                  <div>
                    <h4 className="text-sm font-bold text-[var(--color-zesty-orange)]">Limit Antrean Tercapai</h4>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-[var(--color-zesty-orange)]/80">
                      Anda masih memiliki {pendingCount} request yang sedang mengantre atau diproses. 
                      Mohon tunggu Superadmin merespon request sebelumnya agar kualitas pembuatan prompt tetap maksimal.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                className="primary-button w-full justify-center py-4 text-base" 
                type="submit" 
                disabled={status === "loading"}
              >
                {status === "success" ? (
                  <CheckCircle2 className="mr-2 h-5 w-5" aria-hidden="true" />
                ) : (
                  <Send className="mr-2 h-5 w-5" aria-hidden="true" />
                )}
                {status === "loading" ? "Mengirim Request..." : "Kirim Request Sekarang"}
              </button>
            )}
          </form>
        </div>
      </FadeIn>

      {/* Kanan: Riwayat Request */}
      <FadeIn className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]">
          <History className="h-4 w-4" />
          Riwayat Request Saya
        </div>

        {loadingRequests ? (
          <div className="flex h-40 items-center justify-center rounded-[32px] border border-[rgba(83,88,98,0.08)] bg-white/50 dark:bg-[var(--color-canvas-white)]/50">
            <p className="text-sm font-medium text-[var(--color-ash-gray)]">Memuat riwayat...</p>
          </div>
        ) : myRequests.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[rgba(83,88,98,0.1)] bg-white/50 dark:bg-[var(--color-canvas-white)]/50 p-6 text-center">
            <MessageSquarePlus className="mb-4 h-10 w-10 text-[var(--color-ash-gray)] opacity-50" />
            <h3 className="font-aeonik text-lg text-[var(--color-obsidian)]">Belum Ada Request</h3>
            <p className="mt-2 text-xs text-[var(--color-silver-pine)]">Request yang kamu kirimkan akan muncul dan bisa dilacak di sini.</p>
          </div>
        ) : (
          <Stagger className="flex flex-col gap-3">
            {myRequests.map((req) => (
              <LiftCard key={req.id} className="rounded-2xl bg-white dark:bg-[var(--color-canvas-white)] p-5 shadow-[var(--shadow-subtle)] border border-[rgba(83,88,98,0.06)] dark:border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-bold leading-tight text-[var(--color-obsidian)]">{req.title}</h4>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.04em] ${
                    req.status === "pending" ? "bg-[var(--color-whisper-fade-orange)] text-[var(--color-zesty-orange)]" :
                    req.status === "approved" || req.status === "done" ? "bg-[var(--color-mint-glaze)] text-[var(--color-silver-pine)]" :
                    "bg-[var(--color-arctic-mist)] text-[var(--color-silver-pine)]"
                  }`}>
                    {req.status}
                  </span>
                </div>
                <p className="mt-3 text-xs font-medium leading-relaxed text-[var(--color-silver-pine)] line-clamp-3">
                  {req.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-[rgba(83,88,98,0.06)] dark:border-white/5 pt-3">
                  <span className="text-[10px] font-bold text-[var(--color-ash-gray)]">TARGET: {req.target_model || "All AI"}</span>
                  <span className="text-[10px] font-medium text-[var(--color-ash-gray)]">
                    {new Date(req.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </LiftCard>
            ))}
          </Stagger>
        )}
      </FadeIn>
    </div>
  );
}
