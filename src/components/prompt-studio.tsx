"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand,
  ChevronLeft,
  Sparkles,
  Terminal,
  Copy,
  ExternalLink,
  Layers,
  Zap,
} from "lucide-react";
import type { PromptGeneratorView } from "@/lib/prompt-data";

export function PromptStudio({ generators }: { generators: PromptGeneratorView[] }) {
  const [selectedGen, setSelectedGen] = useState<PromptGeneratorView | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "ready" | "generating" | "generated">("idle");
  const [copied, setCopied] = useState(false);

  // Use only published generators
  const publishedGenerators = generators.filter((g) => g.is_published);

  function selectGenerator(gen: PromptGeneratorView) {
    setSelectedGen(gen);
    setFormValues({});
    setGeneratedPrompt("");
    setStatus("idle");
  }

  function handleInputChange(name: string, value: string) {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setStatus("ready");
  }

  function generatePrompt() {
    if (!selectedGen) return;
    setStatus("generating");
    
    // Simple mock delay to feel like "generating"
    setTimeout(() => {
      let result = selectedGen.prompt_template;
      
      // Interpolate {{variables}}
      const matches = result.match(/\{\{([^}]+)\}\}/g) || [];
      matches.forEach((match) => {
        const key = match.replace(/\{\{|\}\}/g, "");
        const value = formValues[key] || "";
        result = result.replace(new RegExp(match, "g"), value);
      });

      setGeneratedPrompt(result);
      setStatus("generated");
    }, 600);
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openChatGPT() {
    // encode prompt and open ChatGPT
    const url = `https://chatgpt.com/?q=${encodeURIComponent(generatedPrompt)}`;
    window.open(url, "_blank");
  }

  if (!selectedGen) {
    return (
      <div className="space-y-6">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-[var(--shadow-lg)] border border-[rgba(83,88,98,0.08)]">
          <h2 className="font-aeonik text-3xl font-bold tracking-tight text-[var(--color-obsidian)] mb-3">
            AI Prompt Studio
          </h2>
          <p className="text-[var(--color-silver-pine)] max-w-2xl leading-relaxed">
            Tidak perlu pusing merangkai kata. Pilih template generator, isi formulir dengan detail spesifik Anda, dan biarkan sistem merakit prompt JSON kelas profesional secara otomatis.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publishedGenerators.length === 0 ? (
            <div className="col-span-full py-12 text-center text-[var(--color-silver-pine)]">
              Belum ada generator yang dipublikasikan.
            </div>
          ) : (
            publishedGenerators.map((gen) => (
              <button
                key={gen.id}
                onClick={() => selectGenerator(gen)}
                className="group flex flex-col items-start justify-between rounded-3xl bg-white p-6 shadow-[var(--shadow-md)] border border-[rgba(83,88,98,0.05)] transition-all hover:border-[var(--color-electric-blue)] hover:shadow-[var(--shadow-lg)] text-left"
              >
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-sky-wash)] text-[var(--color-electric-blue)] transition-colors group-hover:bg-[var(--color-electric-blue)] group-hover:text-white">
                    <Wand className="h-6 w-6" />
                  </div>
                  <h3 className="font-aeonik text-xl font-bold text-[var(--color-obsidian)] mb-2 group-hover:text-[var(--color-electric-blue)] transition-colors">
                    {gen.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-[var(--color-silver-pine)] leading-relaxed">
                    {gen.description}
                  </p>
                </div>
                <div className="mt-6 font-bold text-xs text-[var(--color-electric-blue)] flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                  Mulai Generate <ChevronLeft className="h-3 w-3 rotate-180" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // The 2-Column Generator UI
  const schema: any[] = selectedGen.form_schema || [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-120px)]">
      {/* Left Column: Form Builder */}
      <div className="flex-1 flex flex-col rounded-3xl bg-white shadow-[var(--shadow-lg)] border border-[rgba(83,88,98,0.08)] overflow-hidden">
        <div className="flex items-center gap-4 bg-[var(--color-arctic-mist)] px-6 py-5 border-b border-[rgba(83,88,98,0.1)]">
          <button onClick={() => setSelectedGen(null)} className="icon-button bg-white shadow-sm" title="Kembali">
            <ChevronLeft className="h-5 w-5 text-[var(--color-obsidian)]" />
          </button>
          <div>
            <h2 className="font-aeonik text-xl font-bold text-[var(--color-obsidian)] leading-none mb-1">
              {selectedGen.title}
            </h2>
            <p className="text-xs font-semibold text-[var(--color-silver-pine)]">
              Isi formulir untuk merakit prompt.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {schema.length === 0 ? (
            <p className="text-[var(--color-silver-pine)] text-center py-10">Formulir kosong. Admin belum mengatur form schema.</p>
          ) : (
            schema.map((section: any, sIdx: number) => (
              <div key={section.id || sIdx} className="rounded-2xl border border-[rgba(83,88,98,0.1)] bg-[var(--color-sky-wash)] overflow-hidden">
                <div className="bg-white/50 px-5 py-3 border-b border-[rgba(83,88,98,0.08)]">
                  <h3 className="font-bold text-xs tracking-widest uppercase text-[var(--color-silver-pine)]">
                    {section.title}
                  </h3>
                </div>
                <div className="p-5 space-y-5">
                  {(section.fields || []).map((field: any) => (
                    <div key={field.id || field.name}>
                      <label className="mb-1.5 block text-sm font-bold text-[var(--color-obsidian)]">
                        {field.label}
                      </label>
                      
                      {field.type === "textarea" ? (
                        <textarea
                          className="form-input min-h-[100px] text-sm bg-white"
                          value={formValues[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                        />
                      ) : field.type === "select" ? (
                        <select
                          className="form-input text-sm bg-white"
                          value={formValues[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                        >
                          <option value="" disabled>Pilih {field.label}</option>
                          {(field.options || "").split(",").map((opt: string) => (
                            <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                          ))}
                        </select>
                      ) : field.type === "tags" ? (
                        <input
                          type="text"
                          className="form-input text-sm bg-white"
                          value={formValues[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder="Pisahkan dengan koma..."
                        />
                      ) : (
                        <input
                          type="text"
                          className="form-input text-sm bg-white"
                          value={formValues[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Terminal UI */}
      <div className="lg:w-[450px] flex flex-col rounded-3xl bg-[var(--color-midnight-ink)] shadow-2xl overflow-hidden text-white relative">
        {/* Mockup Wireframe Area */}
        <div className="h-48 bg-[#11141A] relative border-b border-white/5 flex flex-col items-center justify-center p-6">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-white/30 text-xs font-bold tracking-widest">
            <Layers className="h-4 w-4" />
            MOCKUP WIREFRAME
          </div>
          <div className="w-full max-w-[200px] h-20 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center opacity-50">
            <Sparkles className="h-6 w-6 text-white/40" />
          </div>
          <div className="w-3/4 h-2 bg-white/10 rounded-full mt-4"></div>
          <div className="w-1/2 h-2 bg-white/10 rounded-full mt-2"></div>
        </div>

        {/* Terminal Area */}
        <div className="flex-1 p-6 flex flex-col relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-purple-400" />
              <h3 className="font-mono text-sm font-bold text-white/90">Output Prompt</h3>
            </div>
            <div className="text-[10px] font-bold text-white/30 tracking-widest uppercase">
              {status === "idle" && "Idle"}
              {status === "ready" && "Ready"}
              {status === "generating" && <span className="text-yellow-400 animate-pulse">Processing...</span>}
              {status === "generated" && <span className="text-green-400">Success</span>}
            </div>
          </div>

          <div className="flex-1 font-mono text-xs leading-relaxed space-y-2">
            <p className="text-white/40">{'>'} _ PROMPT TERMINAL - {status.toUpperCase()}</p>
            <p className="text-white/60">$ engine build --template="{selectedGen.title.toLowerCase().replace(/\\s+/g, '-')}"</p>
            <p className="text-green-400/80">{'>'} form input : connected</p>
            <p className="text-green-400/80">{'>'} template : ready</p>
            <p className="text-yellow-400/80">{'>'} output : {status === "generated" ? "generated" : "awaiting trigger"}</p>
            
            {status === "idle" || status === "ready" ? (
              <p className="text-white/40 mt-8 animate-pulse">{'>'} klik tombol Generate untuk merakit prompt</p>
            ) : null}

            {status === "generated" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-[#11141A] rounded-xl p-4 border border-white/10 text-white/80 whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar"
              >
                {generatedPrompt}
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {status !== "generated" ? (
              <button 
                onClick={generatePrompt}
                disabled={status === "generating"}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {status === "generating" ? "Processing..." : "Generate Prompt"}
                <Zap className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button 
                  onClick={generatePrompt}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                  title="Generate Ulang"
                >
                  <Zap className="h-4 w-4" />
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button 
                  onClick={openChatGPT}
                  className="flex-1 bg-white hover:bg-gray-100 text-[var(--color-obsidian)] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  AI Open
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
