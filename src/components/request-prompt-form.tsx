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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (source !== "supabase" || !supabase) {
      setStatus("error");
      setMessage("Supabase belum aktif, request belum bisa disimpan.");
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
            className="absolute right-0 top-14 z-20 w-[min(92vw,420px)] space-y-4 rounded-[28px] border border-[rgba(83,88,98,0.14)] bg-white p-5 text-left shadow-[var(--shadow-lg)]"
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
          </motion.form>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
