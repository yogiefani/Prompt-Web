"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand,
  ChevronLeft,
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
  ChevronRight,
  MessageSquare,
  FileText,
  Settings,
  Database,
  Users,
  Mail,
  Globe,
  Briefcase,
  PenTool,
  Camera,
  Video,
  Music,
  Mic,
  Heart,
  Star,
  Flame,
  Layout,
  Box,
  Terminal,
  Code2,
} from "lucide-react";
import type { PromptGeneratorView } from "@/lib/prompt-data";

export const ICONS: Record<string, React.ElementType> = {
  wand: Wand, sparkles: Sparkles, zap: Zap, message_square: MessageSquare, image: ImageIcon, code2: Code2, file_text: FileText, settings: Settings, database: Database, users: Users, mail: Mail, globe: Globe, briefcase: Briefcase, pen_tool: PenTool, camera: Camera, video: Video, music: Music, mic: Mic, heart: Heart, star: Star, flame: Flame, layout: Layout, box: Box, terminal: Terminal
};

export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] || Wand;
  return <Icon className={className} />;
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type HistoryItem = { id: string; timestamp: string; output: string };

// ─────────────────────────────────────────────
// ChipsInput
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
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
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
      className="form-input flex min-h-[44px] flex-wrap gap-1.5 cursor-text p-2"
      onClick={() => inputRef.current?.focus()}
    >
      {chips.map((chip) => (
        <motion.span
          key={chip}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-1 rounded-lg bg-[var(--color-whisper-fade-blue)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-electric-blue)] border border-[rgba(0,105,224,0.15)]"
        >
          {chip}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(chips.filter((c) => c !== chip).join(", "));
            }}
            className="text-[var(--color-electric-blue)]/60 hover:text-[var(--color-electric-blue)] transition-colors"
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
        className="flex-1 min-w-[120px] bg-transparent text-sm text-[var(--color-obsidian)] outline-none placeholder:text-[var(--color-ash-gray)]"
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
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"([^"]+)"(\s*:)/g, '<span style="color:var(--color-electric-blue);font-weight:700">"$1"</span>$2')
      .replace(/:\s*"([^"]*)"/g, ': <span style="color:var(--color-silver-pine)">"$1"</span>')
      .replace(/:\s*(true|false)/g, ': <span style="color:var(--color-deep-violet)">$1</span>')
      .replace(/:\s*([0-9.]+)/g, ': <span style="color:var(--color-deep-violet)">$1</span>');
    return (
      <pre
        className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[var(--color-obsidian)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[var(--color-obsidian)]">{text}</pre>;
  }
}

// ─────────────────────────────────────────────
// Reference Image Modal (Lightbox)
// ─────────────────────────────────────────────
function ReferenceModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 icon-button"
        >
          <X className="h-4 w-4" />
        </button>
        <img src={url} alt="Style Reference" className="w-full object-contain max-h-[70vh]" />
      </motion.div>
    </motion.div>
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
      className="absolute inset-0 z-20 flex flex-col bg-white rounded-3xl border border-[rgba(83,88,98,0.12)] shadow-[var(--shadow-lg)] overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(83,88,98,0.08)] bg-[var(--color-arctic-mist)]">
        <div className="flex items-center gap-2 font-bold text-[var(--color-obsidian)] text-sm">
          <Clock className="h-4 w-4 text-[var(--color-electric-blue)]" />
          Riwayat Generate
        </div>
        <button onClick={onClose} className="icon-button">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 && (
          <p className="text-center text-sm text-[var(--color-silver-pine)] pt-8">
            Belum ada riwayat generate.
          </p>
        )}
        {history.map((item, i) => (
          <button
            key={item.id}
            onClick={() => { onSelect(item); onClose(); }}
            className="w-full text-left rounded-2xl border border-[rgba(83,88,98,0.1)] bg-[var(--color-arctic-mist)] p-4 hover:border-[var(--color-electric-blue)]/30 hover:bg-[var(--color-whisper-fade-blue)] transition-colors"
          >
            <div className="text-xs text-[var(--color-silver-pine)] mb-1.5 flex items-center gap-1.5">
              <span className="font-bold text-[var(--color-electric-blue)]">#{i + 1}</span>
              <span>{item.timestamp}</span>
            </div>
            <p className="text-xs font-mono text-[var(--color-obsidian)] line-clamp-3">{item.output}</p>
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
      <div className="flex flex-col items-center justify-center h-[400px] rounded-3xl bg-white border border-[rgba(83,88,98,0.1)] shadow-[var(--shadow-lg)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-whisper-fade-yellow)] mb-4">
          <Sparkles className="h-8 w-8 text-[var(--color-sunburst-yellow)]" />
        </div>
        <p className="font-aeonik text-xl font-bold text-[var(--color-obsidian)]">Belum ada Generator</p>
        <p className="text-sm text-[var(--color-silver-pine)] mt-1.5">Superadmin belum mempublikasikan generator apa pun.</p>
      </div>
    );
  }

  // ── Main Layout ──────────────────────────
  return (
    <>
      <AnimatePresence>
        {referenceUrl && <ReferenceModal url={referenceUrl} onClose={() => setReferenceUrl(null)} />}
      </AnimatePresence>

      <div className="flex gap-4 h-[calc(100vh-130px)] min-h-[600px]">

        {/* ── Sidebar: Generator Navigator ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 60, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex flex-col items-center gap-2 rounded-3xl bg-white border border-[rgba(83,88,98,0.1)] shadow-[var(--shadow-lg)] py-4 overflow-hidden shrink-0"
            >
              {published.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActiveId(g.id)}
                  title={g.title}
                  className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
                    g.id === activeId
                      ? "bg-[var(--color-midnight-ink)] text-white shadow-[var(--shadow-subtle)]"
                      : "text-[var(--color-silver-pine)] hover:bg-[var(--color-sky-wash)] hover:text-[var(--color-electric-blue)]"
                  }`}
                >
                  <DynamicIcon name={g.icon as string} className="h-5 w-5" />
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute left-full ml-3 z-30 hidden group-hover:block">
                    <div className="whitespace-nowrap rounded-xl bg-[var(--color-midnight-ink)] px-3 py-1.5 text-xs font-bold text-white shadow-xl">
                      {g.title}
                    </div>
                  </div>
                </button>
              ))}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Form Panel (Left) ── */}
        <div className="flex-1 flex flex-col rounded-3xl bg-white border border-[rgba(83,88,98,0.1)] shadow-[var(--shadow-lg)] overflow-hidden">
          {/* Form Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(83,88,98,0.08)] bg-[var(--color-arctic-mist)] shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="icon-button"
                title={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
              >
                {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <div>
                <h2 className="font-aeonik text-base font-bold text-[var(--color-obsidian)] leading-none">{gen?.title}</h2>
                <p className="text-xs text-[var(--color-silver-pine)] mt-0.5 line-clamp-1">{gen?.description}</p>
              </div>
            </div>
            {gen?.demo_values && Object.keys(gen.demo_values).length > 0 && (
              <button
                onClick={randomizeDemo}
                disabled={randomizing}
                className="flex items-center gap-2 rounded-2xl bg-[var(--color-whisper-fade-orange)] hover:bg-[rgba(242,97,16,0.12)] text-[var(--color-zesty-orange)] font-bold text-xs px-3.5 py-2 border border-[rgba(242,97,16,0.15)] transition-colors disabled:opacity-50"
              >
                <Shuffle className={`h-3.5 w-3.5 ${randomizing ? "animate-spin" : ""}`} />
                Randomize Demo
              </button>
            )}
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {schema.length === 0 ? (
              <p className="text-center text-sm text-[var(--color-silver-pine)] pt-16">
                Admin belum mengatur form schema untuk generator ini.
              </p>
            ) : (
              schema.map((section: any, sIdx: number) => (
                <div key={section.id ?? sIdx}>
                  {/* Section Header */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--color-midnight-ink)] text-white text-xs font-black shrink-0">
                      {"ABCDEFGHIJ"[sIdx] ?? sIdx + 1}
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-silver-pine)]">
                      {section.title}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {(section.fields ?? []).map((field: any) => (
                      <div key={field.id ?? field.name}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="text-sm font-bold text-[var(--color-obsidian)]">{field.label}</label>
                          {field.type === "select" && field.reference_url && (
                            <button
                              onClick={() => setReferenceUrl(field.reference_url)}
                              className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-electric-blue)] hover:text-[var(--color-electric-blue)]/70 transition-colors"
                            >
                              <ImageIcon className="h-3 w-3" /> LIHAT REFERENSI
                            </button>
                          )}
                        </div>

                        {field.type === "textarea" ? (
                          <textarea
                            className="form-input min-h-[90px] resize-none text-sm"
                            value={formValues[field.name] ?? ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder ?? `Masukkan ${field.label.toLowerCase()}...`}
                          />
                        ) : field.type === "select" ? (
                          <select
                            className="form-input text-sm"
                            value={formValues[field.name] ?? ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                          >
                            <option value="" disabled>Pilih {field.label}...</option>
                            {(field.options ?? "").split(",").map((opt: string) => (
                              <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                            ))}
                          </select>
                        ) : field.type === "chips" ? (
                          <ChipsInput
                            value={formValues[field.name] ?? ""}
                            onChange={(v) => handleChange(field.name, v)}
                            placeholder={field.placeholder}
                          />
                        ) : field.type === "color" ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={formValues[field.name] ?? "#0069e0"}
                              onChange={(e) => handleChange(field.name, e.target.value)}
                              className="h-11 w-14 rounded-xl border border-[rgba(83,88,98,0.16)] bg-white cursor-pointer p-1"
                            />
                            <input
                              type="text"
                              value={formValues[field.name] ?? ""}
                              onChange={(e) => handleChange(field.name, e.target.value)}
                              placeholder="#0069e0"
                              className="form-input flex-1 text-sm font-mono"
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            className="form-input text-sm"
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

            {/* Output Panel for Mobile (only visible on screens < lg) */}
            {status === "done" && output && (
              <div className="mt-8 rounded-2xl border border-[rgba(83,88,98,0.1)] bg-[var(--color-arctic-mist)] p-4 lg:hidden space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(83,88,98,0.08)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--color-obsidian)]">Output Prompt</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isJson
                        ? "bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)]"
                        : "bg-[var(--color-mint-glaze)] text-[var(--color-obsidian)]"
                    }`}>
                      {isJson ? "JSON" : "TEXT"}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-[rgba(83,88,98,0.08)] bg-white p-4 shadow-sm">
                  {isJson ? <JsonOutput text={output} /> : (
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[var(--color-obsidian)]">{output}</pre>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyOutput}
                    className="secondary-button flex-1 py-2 text-xs"
                    type="button"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => window.open(`https://chatgpt.com/?q=${encodeURIComponent(output)}`, "_blank")}
                    className="primary-button flex-1 py-2 text-xs"
                    type="button"
                  >
                    <ExternalLink className="h-4 w-4" /> Buka AI
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="p-4 border-t border-[rgba(83,88,98,0.08)] bg-[var(--color-arctic-mist)] shrink-0">
            <button
              onClick={generate}
              disabled={status === "generating"}
              className="primary-button w-full justify-center disabled:opacity-50"
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
        <div className="w-[420px] flex-col rounded-3xl bg-white border border-[rgba(83,88,98,0.1)] shadow-[var(--shadow-lg)] overflow-hidden relative shrink-0 hidden lg:flex">
          {/* Preview Area */}
          <div className="h-[170px] bg-[var(--color-midnight-ink)] border-b border-[rgba(83,88,98,0.08)] relative overflow-hidden shrink-0 rounded-t-3xl">
            {gen?.preview_image_url ? (
              <img src={gen.preview_image_url} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "18px 18px" }}
                />
                <Layers className="h-6 w-6 text-white/20" />
                <div className="space-y-2 w-full max-w-[160px]">
                  <div className="h-1.5 w-full bg-white/10 rounded-full" />
                  <div className="h-1.5 w-3/4 bg-white/10 rounded-full" />
                  <div className="h-1.5 w-1/2 bg-white/10 rounded-full" />
                </div>
                <p className="text-[9px] font-black text-white/20 tracking-[0.2em] uppercase">Mockup Preview</p>
              </div>
            )}
          </div>

          {/* Terminal Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(83,88,98,0.08)] bg-[var(--color-arctic-mist)] shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              </div>
              <span className="text-xs font-bold text-[var(--color-obsidian)]">Output Prompt</span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isJson
                  ? "bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)]"
                  : "bg-[var(--color-mint-glaze)] text-[var(--color-obsidian)]"
              }`}>
                {isJson ? "JSON" : "TEXT"}
              </span>
            </div>
            <button
              onClick={() => setShowHistory((v) => !v)}
              className={`icon-button ${showHistory ? "active" : ""}`}
              title="Riwayat"
            >
              <Clock className="h-4 w-4" />
            </button>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 overflow-hidden relative bg-[var(--color-arctic-mist)]">
            <AnimatePresence>
              {showHistory && (
                <HistoryDrawer
                  history={history}
                  onSelect={(item) => { setOutput(item.output); setStatus("done"); }}
                  onClose={() => setShowHistory(false)}
                />
              )}
            </AnimatePresence>

            <div className="h-full overflow-y-auto p-5">
              {status === "idle" && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-whisper-fade-blue)]">
                    <Zap className="h-7 w-7 text-[var(--color-electric-blue)]" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--color-obsidian)] text-sm">Isi formulir lalu tekan</p>
                    <p className="font-bold text-[var(--color-obsidian)] text-sm">&quot;Generate Prompt&quot;</p>
                  </div>
                  <div className="font-mono text-xs text-[var(--color-silver-pine)] text-left space-y-1 mt-2">
                    <p><span className="text-green-600">✓</span> template : ready</p>
                    <p><span className="text-[var(--color-ash-gray)]">○</span> output : <span className="text-[var(--color-zesty-orange)]">awaiting trigger</span></p>
                  </div>
                </div>
              )}

              {status === "generating" && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-10 w-10 rounded-full border-2 border-[rgba(0,105,224,0.15)] border-t-[var(--color-electric-blue)]"
                  />
                  <div className="font-mono text-xs text-[var(--color-silver-pine)] text-center space-y-1">
                    <p className="text-[var(--color-electric-blue)] animate-pulse font-bold">Processing...</p>
                    <p>interpolating variables...</p>
                    <p>building output...</p>
                  </div>
                </div>
              )}

              {status === "done" && output && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-[rgba(83,88,98,0.1)] bg-white p-4 shadow-sm"
                >
                  {isJson ? <JsonOutput text={output} /> : (
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[var(--color-obsidian)]">{output}</pre>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer: stats + actions */}
          <div className="border-t border-[rgba(83,88,98,0.08)] bg-[var(--color-arctic-mist)] shrink-0">
            {status === "done" && (
              <div className="px-5 py-2 text-[10px] font-mono font-bold text-[var(--color-ash-gray)]">
                {charCount.toLocaleString()} chars · {lineCount} lines
              </div>
            )}
            <div className="flex gap-2 p-4 pt-2">
              {status === "done" ? (
                <>
                  <button
                    onClick={copyOutput}
                    className="secondary-button flex-1"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => window.open(`https://chatgpt.com/?q=${encodeURIComponent(output)}`, "_blank")}
                    className="primary-button flex-1"
                  >
                    <ExternalLink className="h-4 w-4" /> Buka AI
                  </button>
                </>
              ) : (
                <div className="flex-1 text-center text-xs font-mono text-[var(--color-ash-gray)] py-1">
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
