"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Copy,
  ExternalLink,
  Zap,
  Clock,
  X,
  Image as ImageIcon,
  Shuffle,
  Check,
  RotateCcw,
  Layers,
} from "lucide-react";
import type { PromptGeneratorView } from "@/lib/prompt-data";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type HistoryItem = { id: string; timestamp: string; output: string };

// ─────────────────────────────────────────────
// ChipsInput — interactive multi-tag input
// ─────────────────────────────────────────────
function ChipsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const chips = value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit(raw: string) {
    const chip = raw.trim().replace(/,/g, "");
    if (!chip || chips.includes(chip)) { setDraft(""); return; }
    onChange([...chips, chip].join(", "));
    setDraft("");
  }

  return (
    <div
      className="flex min-h-[44px] flex-wrap gap-1.5 rounded-xl border border-[#30363D] bg-[#0D1117] px-3 py-2 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {chips.map((chip) => (
        <motion.span
          key={chip}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          className="flex items-center gap-1 rounded-lg bg-orange-500/20 px-2.5 py-0.5 text-xs font-bold text-orange-300 border border-orange-500/30"
        >
          {chip}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(chips.filter((c) => c !== chip).join(", ")); }}
            className="text-orange-400 hover:text-white transition-colors"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </motion.span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(draft); }
          if (e.key === "Backspace" && !draft && chips.length > 0) {
            onChange(chips.slice(0, -1).join(", "));
          }
        }}
        onBlur={() => { if (draft) commit(draft); }}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-[#E6EDF3] outline-none placeholder:text-[#8B949E]"
        placeholder={chips.length === 0 ? (placeholder ?? "Ketik lalu tekan Enter atau koma...") : ""}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// JSON Syntax Highlighter
// ─────────────────────────────────────────────
function JsonOutput({ text }: { text: string }) {
  try {
    JSON.parse(text);
    const html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"([^"]+)"(\s*:)/g, '<span style="color:#F97316">"$1"</span>$2')
      .replace(/:\s*"([^"]*)"/g, ': <span style="color:#A5D6A7">"$1"</span>')
      .replace(/:\s*(true|false)/g, ': <span style="color:#79C0FF">$1</span>')
      .replace(/:\s*([0-9.]+)/g, ': <span style="color:#79C0FF">$1</span>');
    return (
      <pre
        className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[#E6EDF3]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[#E6EDF3]">{text}</pre>;
  }
}

// ─────────────────────────────────────────────
// Reference Image Modal (Lightbox)
// ─────────────────────────────────────────────
function ReferenceModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          className="relative max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
          <img src={url} alt="Style Reference" className="w-full object-contain max-h-[70vh]" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// History Drawer
// ─────────────────────────────────────────────
function HistoryDrawer({
  history,
  onSelect,
  onClose,
}: {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-0 z-20 flex flex-col bg-[#161B22] rounded-3xl border border-[#30363D] overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363D]">
        <div className="flex items-center gap-2 font-bold text-[#E6EDF3]">
          <Clock className="h-4 w-4 text-orange-400" />
          Riwayat Generate
        </div>
        <button onClick={onClose} className="p-1 text-[#8B949E] hover:text-[#E6EDF3]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 && (
          <p className="text-center text-sm text-[#8B949E] pt-8">Belum ada riwayat generate.</p>
        )}
        {history.map((item, i) => (
          <button
            key={item.id}
            onClick={() => { onSelect(item); onClose(); }}
            className="w-full text-left rounded-xl border border-[#30363D] bg-[#0D1117] p-4 hover:border-orange-500/50 transition-colors"
          >
            <div className="text-xs text-[#8B949E] mb-1.5 flex items-center gap-1.5">
              <span className="font-bold text-orange-400">#{i + 1}</span>
              <span>{item.timestamp}</span>
            </div>
            <p className="text-xs font-mono text-[#E6EDF3] line-clamp-3">{item.output}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function PromptStudio({ generators }: { generators: PromptGeneratorView[] }) {
  const published = generators.filter((g) => g.is_published);
  const [activeId, setActiveId] = useState<string>(published[0]?.id ?? "");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [randomizing, setRandomizing] = useState(false);

  const gen = published.find((g) => g.id === activeId) ?? published[0] ?? null;

  // Reset form when switching generator
  useEffect(() => {
    setFormValues({});
    setOutput("");
    setStatus("idle");
    setShowHistory(false);
  }, [activeId]);

  function handleChange(name: string, value: string) {
    setFormValues((p) => ({ ...p, [name]: value }));
  }

  function randomizeDemo() {
    if (!gen?.demo_values) return;
    setRandomizing(true);
    const vals = gen.demo_values as Record<string, string>;
    const keys = Object.keys(vals);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= keys.length) { clearInterval(interval); setRandomizing(false); return; }
      const key = keys[i];
      setFormValues((prev) => ({ ...prev, [key]: vals[key] }));
      i++;
    }, 80);
  }

  function generate() {
    if (!gen) return;
    setStatus("generating");
    setOutput("");
    setTimeout(() => {
      let result = gen.prompt_template;
      const matches = result.match(/\{\{([^}]+)\}\}/g) ?? [];
      matches.forEach((m) => {
        const key = m.slice(2, -2);
        const val = formValues[key] ?? "";
        result = result.split(m).join(val);
      });
      setOutput(result);
      setStatus("done");
      setHistory((prev) => [
        { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString("id-ID"), output: result },
        ...prev,
      ].slice(0, 5));
    }, 900);
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const charCount = output.length;
  const lineCount = output ? output.split("\n").length : 0;
  const isJson = gen?.output_format === "json";
  const schema: any[] = gen?.form_schema ?? [];

  // ── Empty state ──────────────────────────
  if (published.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] rounded-3xl bg-[#0D1117]">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <p className="text-[#E6EDF3] font-bold text-lg">Belum ada Generator</p>
          <p className="text-[#8B949E] text-sm mt-1">Superadmin belum mempublikasikan generator apa pun.</p>
        </div>
      </div>
    );
  }

  // ── Main Layout ──────────────────────────
  return (
    <>
      {referenceUrl && <ReferenceModal url={referenceUrl} onClose={() => setReferenceUrl(null)} />}

      <div className="flex gap-4 h-[calc(100vh-130px)] min-h-[600px]">
        {/* ── Sidebar: Generator Navigator ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 64, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex flex-col items-center gap-2 rounded-3xl bg-[#161B22] border border-[#30363D] py-4 overflow-hidden shrink-0"
            >
              {published.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActiveId(g.id)}
                  title={g.title}
                  className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
                    g.id === activeId
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                      : "text-[#8B949E] hover:bg-[#21262D] hover:text-[#E6EDF3]"
                  }`}
                >
                  <Wand className="h-5 w-5" />
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute left-full ml-2 z-30 hidden group-hover:block">
                    <div className="whitespace-nowrap rounded-lg bg-[#21262D] border border-[#30363D] px-3 py-1.5 text-xs font-bold text-[#E6EDF3] shadow-xl">
                      {g.title}
                    </div>
                  </div>
                </button>
              ))}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Form Panel (Left) ── */}
        <div className="flex-1 flex flex-col rounded-3xl bg-[#161B22] border border-[#30363D] overflow-hidden">
          {/* Form Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363D] shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen((v) => !v)} className="p-1.5 rounded-lg text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]">
                {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <div>
                <h2 className="font-aeonik text-base font-bold text-[#E6EDF3] leading-none">{gen?.title}</h2>
                <p className="text-xs text-[#8B949E] mt-0.5">{gen?.description}</p>
              </div>
            </div>
            {gen?.demo_values && Object.keys(gen.demo_values).length > 0 && (
              <button
                onClick={randomizeDemo}
                disabled={randomizing}
                className="flex items-center gap-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 font-bold text-xs px-3.5 py-2 border border-orange-500/30 transition-colors disabled:opacity-50"
              >
                <Shuffle className={`h-3.5 w-3.5 ${randomizing ? "animate-spin" : ""}`} />
                Randomize Demo
              </button>
            )}
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6" style={{ scrollbarWidth: "thin", scrollbarColor: "#30363D transparent" }}>
            {schema.length === 0 ? (
              <p className="text-center text-sm text-[#8B949E] pt-16">Admin belum mengatur form schema untuk generator ini.</p>
            ) : (
              schema.map((section: any, sIdx: number) => (
                <div key={section.id ?? sIdx}>
                  {/* Section Label */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-black">
                      {"ABCDEFGHIJ"[sIdx] ?? sIdx + 1}
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#8B949E]">{section.title}</h3>
                  </div>

                  <div className="space-y-4">
                    {(section.fields ?? []).map((field: any) => (
                      <div key={field.id ?? field.name}>
                        {/* Field Label */}
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="text-sm font-bold text-[#E6EDF3]">{field.label}</label>
                          {field.type === "select" && field.reference_url && (
                            <button
                              onClick={() => setReferenceUrl(field.reference_url)}
                              className="flex items-center gap-1 text-[10px] font-bold text-orange-400 hover:text-orange-300 transition-colors"
                            >
                              <ImageIcon className="h-3 w-3" /> LIHAT REFERENSI
                            </button>
                          )}
                        </div>

                        {/* Input by type */}
                        {field.type === "textarea" ? (
                          <textarea
                            className="w-full min-h-[90px] resize-none rounded-xl border border-[#30363D] bg-[#0D1117] px-4 py-3 text-sm text-[#E6EDF3] placeholder:text-[#484F58] outline-none focus:border-orange-500/60 transition-colors"
                            value={formValues[field.name] ?? ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder ?? `Masukkan ${field.label.toLowerCase()}...`}
                          />
                        ) : field.type === "select" ? (
                          <select
                            className="w-full rounded-xl border border-[#30363D] bg-[#0D1117] px-4 py-3 text-sm text-[#E6EDF3] outline-none focus:border-orange-500/60 transition-colors appearance-none"
                            value={formValues[field.name] ?? ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                          >
                            <option value="" disabled className="text-[#484F58]">Pilih {field.label}...</option>
                            {(field.options ?? "").split(",").map((opt: string) => (
                              <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                            ))}
                          </select>
                        ) : field.type === "chips" ? (
                          <ChipsInput
                            value={formValues[field.name] ?? ""}
                            onChange={(v) => handleChange(field.name, v)}
                            placeholder={field.placeholder ?? "Ketik lalu Enter atau koma..."}
                          />
                        ) : field.type === "color" ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={formValues[field.name] ?? "#F97316"}
                              onChange={(e) => handleChange(field.name, e.target.value)}
                              className="h-11 w-16 rounded-xl border border-[#30363D] bg-[#0D1117] cursor-pointer p-1"
                            />
                            <input
                              type="text"
                              value={formValues[field.name] ?? ""}
                              onChange={(e) => handleChange(field.name, e.target.value)}
                              placeholder="#F97316"
                              className="flex-1 rounded-xl border border-[#30363D] bg-[#0D1117] px-4 py-3 text-sm text-[#E6EDF3] font-mono placeholder:text-[#484F58] outline-none focus:border-orange-500/60 transition-colors"
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            className="w-full rounded-xl border border-[#30363D] bg-[#0D1117] px-4 py-3 text-sm text-[#E6EDF3] placeholder:text-[#484F58] outline-none focus:border-orange-500/60 transition-colors"
                            value={formValues[field.name] ?? ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder ?? `Masukkan ${field.label.toLowerCase()}...`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Generate Button */}
          <div className="p-4 border-t border-[#30363D] shrink-0">
            <button
              onClick={generate}
              disabled={status === "generating"}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-black text-sm py-3.5 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/25"
            >
              {status === "generating" ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                    <RotateCcw className="h-4 w-4" />
                  </motion.div>
                  Merakit Prompt...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  {status === "done" ? "Generate Ulang" : "Generate Prompt"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Output Panel (Right) ── */}
        <div className="w-[440px] flex-col rounded-3xl bg-[#0D1117] border border-[#30363D] overflow-hidden relative shrink-0 hidden lg:flex">
          {/* Mockup Preview */}
          <div className="h-[180px] bg-[#161B22] border-b border-[#30363D] relative overflow-hidden shrink-0">
            {gen?.preview_image_url ? (
              <img src={gen.preview_image_url} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(#F97316 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                <Layers className="h-6 w-6 text-[#484F58]" />
                <div className="space-y-2 w-full max-w-[200px]">
                  <div className="h-2 w-full bg-[#21262D] rounded-full animate-pulse" />
                  <div className="h-2 w-3/4 bg-[#21262D] rounded-full animate-pulse" />
                  <div className="h-2 w-1/2 bg-[#21262D] rounded-full animate-pulse" />
                </div>
                <p className="text-[10px] font-bold text-[#484F58] tracking-widest">MOCKUP PREVIEW</p>
              </div>
            )}
          </div>

          {/* Terminal Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#30363D] shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                <div className="h-3 w-3 rounded-full bg-[#28C840]" />
              </div>
              <span className="ml-2 text-xs font-bold text-[#8B949E]">Output Prompt</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border">
                {isJson ? (
                  <span className="text-blue-400 border-blue-400/30">JSON</span>
                ) : (
                  <span className="text-green-400 border-green-400/30">TEXT</span>
                )}
              </span>
            </div>
            <button
              onClick={() => setShowHistory((v) => !v)}
              className={`p-1.5 rounded-lg transition-colors ${showHistory ? "bg-orange-500/20 text-orange-400" : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]"}`}
              title="Riwayat"
            >
              <Clock className="h-4 w-4" />
            </button>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence>
              {showHistory && (
                <HistoryDrawer
                  history={history}
                  onSelect={(item) => { setOutput(item.output); setStatus("done"); }}
                  onClose={() => setShowHistory(false)}
                />
              )}
            </AnimatePresence>

            <div className="h-full overflow-y-auto p-5" style={{ scrollbarWidth: "thin", scrollbarColor: "#30363D transparent" }}>
              {status === "idle" && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-orange-400" />
                  </div>
                  <p className="text-sm font-bold text-[#8B949E]">Isi formulir lalu tekan<br />"Generate Prompt"</p>
                  <div className="font-mono text-xs text-[#484F58] text-left mt-4 space-y-1">
                    <p><span className="text-green-400">✓</span> template : ready</p>
                    <p><span className="text-[#484F58]">○</span> output : <span className="text-yellow-500 animate-pulse">awaiting trigger</span></p>
                  </div>
                </div>
              )}

              {status === "generating" && (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-10 w-10 rounded-full border-2 border-orange-500/20 border-t-orange-500"
                  />
                  <div className="font-mono text-xs text-[#8B949E] text-center space-y-1">
                    <p className="text-yellow-400 animate-pulse">Processing...</p>
                    <p className="text-[#484F58]">interpolating variables...</p>
                    <p className="text-[#484F58]">building output...</p>
                  </div>
                </div>
              )}

              {status === "done" && output && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {isJson ? <JsonOutput text={output} /> : (
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[#E6EDF3]">{output}</pre>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer: stats + actions */}
          <div className="border-t border-[#30363D] shrink-0">
            {status === "done" && (
              <div className="px-5 py-2 text-[10px] font-mono text-[#484F58] border-b border-[#30363D]">
                {charCount.toLocaleString()} chars · {lineCount} lines
              </div>
            )}
            <div className="flex gap-2 p-4">
              {status === "done" ? (
                <>
                  <button
                    onClick={copyOutput}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#30363D] bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] font-bold text-sm py-2.5 transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => window.open(`https://chatgpt.com/?q=${encodeURIComponent(output)}`, "_blank")}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#E6EDF3] hover:bg-white text-[#0D1117] font-bold text-sm py-2.5 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" /> AI Open
                  </button>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs font-mono text-[#484F58] py-1">
                  — output will appear after generate —
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
