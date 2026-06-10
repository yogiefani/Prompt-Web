"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Inbox, Loader2 } from "lucide-react";
import type { PromptRequestView } from "@/lib/prompt-data";
import { supabase } from "@/lib/supabase";

type RequestInboxProps = {
  initialRequests: PromptRequestView[];
  source: "supabase" | "fallback";
};

const statusOptions = ["pending", "reviewing", "approved", "done", "declined"];

function formatRequestDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function RequestInbox({ initialRequests, source }: RequestInboxProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === "pending" || request.status === "reviewing").length,
    [requests],
  );

  async function updateStatus(requestId: string, status: string) {
    setRequests((current) =>
      current.map((request) => (request.id === requestId ? { ...request, status } : request)),
    );

    if (source !== "supabase" || !supabase) {
      setMessage("Supabase belum aktif, perubahan status hanya tampil sementara.");
      return;
    }

    setSavingId(requestId);
    setMessage("");

    const { error } = await supabase
      .from("prompt_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    setSavingId("");

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Status request berhasil diperbarui.");
  }

  return (
    <section className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-whisper-fade-blue)] px-4 py-2 text-xs font-semibold text-[var(--color-electric-blue)]">
            <Inbox className="h-4 w-4" aria-hidden="true" />
            Request Inbox
          </span>
          <h2 className="mt-4 font-aeonik text-3xl tracking-[-0.02em]">Permintaan prompt dari member</h2>
          <p className="mt-3 text-sm font-medium leading-6 text-[var(--color-silver-pine)]">
            {pendingCount} request menunggu review atau sedang diproses.
          </p>
        </div>
      </div>

      {message ? (
        <p className="mt-5 rounded-2xl bg-[var(--color-arctic-mist)] px-4 py-3 text-sm font-semibold text-[var(--color-silver-pine)]">
          {message}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {requests.map((request, index) => (
          <motion.article
            key={request.id}
            className="rounded-[28px] border border-[rgba(83,88,98,0.12)] bg-[var(--color-arctic-mist)] p-5"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-aeonik text-xl leading-tight tracking-[-0.02em]">{request.title}</h3>
                <p className="mt-2 text-xs font-semibold text-[var(--color-ash-gray)]">
                  {request.requesterEmail} - {formatRequestDate(request.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {savingId === request.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-electric-blue)]" aria-hidden="true" />
                ) : null}
                <select
                  value={request.status}
                  onChange={(event) => updateStatus(request.id, event.target.value)}
                  className="admin-select min-w-36 bg-white"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--color-mint-glaze)] px-3 py-1 text-xs font-semibold text-[var(--color-silver-pine)]">
                {request.targetModel}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--color-electric-blue)]">
                {request.status}
              </span>
            </div>

            <p className="mt-4 text-sm font-medium leading-6 text-[var(--color-silver-pine)]">
              {request.description}
            </p>
          </motion.article>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="mt-6 rounded-[28px] bg-[var(--color-arctic-mist)] p-8 text-center text-sm font-semibold text-[var(--color-silver-pine)]">
          Belum ada request prompt dari member.
        </div>
      ) : null}
    </section>
  );
}
