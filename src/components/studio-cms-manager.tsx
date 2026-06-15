"use client";

import { useState } from "react";
import {
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
  Wand,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Code2,
  AlignLeft,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Zap,
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
} from "lucide-react";

export const ICONS: Record<string, React.ElementType> = {
  wand: Wand, sparkles: Sparkles, zap: Zap, message_square: MessageSquare, image: ImageIcon, code2: Code2, file_text: FileText, settings: Settings, database: Database, users: Users, mail: Mail, globe: Globe, briefcase: Briefcase, pen_tool: PenTool, camera: Camera, video: Video, music: Music, mic: Mic, heart: Heart, star: Star, flame: Flame, layout: Layout, box: Box, terminal: Terminal
};

export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] || Wand;
  return <Icon className={className} />;
}

function ImageUploader({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label?: string; placeholder?: string }) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-bold text-[var(--color-obsidian)]">{label}</label>}
      <div className="flex gap-2">
        <input className="form-input flex-1 text-sm" value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder || "https://..."} />
        <label className="secondary-button cursor-pointer shrink-0 !min-h-0 !h-[42px]">
           <input type="file" className="hidden" accept="image/*" onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => onChange(ev.target?.result as string);
              reader.readAsDataURL(file);
           }} />
           <ImageIcon className="h-4 w-4" /> Upload
        </label>
      </div>
    </div>
  );
}
import { supabase } from "@/lib/supabase";
import type { PromptGeneratorView } from "@/lib/prompt-data";

type FormField = {
  id: string;
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "tags" | "chips" | "color";
  options?: string;
  reference_url?: string;
  placeholder?: string;
};

type FormSection = {
  id: string;
  title: string;
  fields: FormField[];
};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const FIELD_TYPE_LABELS: Record<FormField["type"], string> = {
  text: "Teks Pendek",
  textarea: "Teks Panjang",
  select: "Pilihan (Select)",
  tags: "Tags (Teks)",
  chips: "Chips (Multi-Tag Interaktif)",
  color: "Color Picker",
};

export function StudioCmsManager({ initialGenerators }: { initialGenerators: PromptGeneratorView[] }) {
  const [generators, setGenerators] = useState<PromptGeneratorView[]>(initialGenerators);
  const [editingGen, setEditingGen] = useState<PromptGeneratorView | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "template" | "settings">("builder");
  const [sections, setSections] = useState<FormSection[]>([]);
  const [showIconPicker, setShowIconPicker] = useState(false);

  function startCreate() {
    setEditingGen({
      id: "",
      title: "Generator Baru",
      description: "",
      icon: "wand",
      form_schema: [],
      prompt_template: "",
      is_published: false,
      preview_image_url: "",
      demo_values: {},
      output_format: "text",
      created_at: new Date().toISOString(),
    });
    setSections([{ id: generateId(), title: "Seksi A", fields: [] }]);
    setActiveTab("builder");
  }

  function editGen(gen: PromptGeneratorView) {
    setEditingGen({ ...gen });
    setSections(gen.form_schema || []);
    setActiveTab("builder");
  }

  async function deleteGen(id: string) {
    if (!supabase) return;
    if (!window.confirm("Yakin ingin menghapus generator ini?")) return;
    const { error } = await supabase.from("prompt_generators").delete().eq("id", id);
    if (!error) setGenerators((prev) => prev.filter((g) => g.id !== id));
    else alert("Error: " + error.message);
  }

  async function saveGen() {
    if (!supabase || !editingGen) return;
    setSaving(true);
    const payload = {
      title: editingGen.title,
      description: editingGen.description,
      icon: editingGen.icon,
      form_schema: sections,
      prompt_template: editingGen.prompt_template,
      is_published: editingGen.is_published,
      preview_image_url: editingGen.preview_image_url || null,
      demo_values: editingGen.demo_values || {},
      output_format: editingGen.output_format || "text",
    };
    let result;
    if (editingGen.id) {
      result = await supabase.from("prompt_generators").update(payload).eq("id", editingGen.id).select().single();
    } else {
      result = await supabase.from("prompt_generators").insert(payload).select().single();
    }
    setSaving(false);
    if (result.error) { alert("Error: " + result.error.message); return; }
    const saved = result.data as PromptGeneratorView;
    if (editingGen.id) {
      setGenerators((prev) => prev.map((g) => (g.id === saved.id ? saved : g)));
    } else {
      setGenerators([saved, ...generators]);
    }
    setEditingGen(null);
  }

  // ── Section helpers ──────────────────────────────────────────
  function addSection() {
    const letters = "ABCDEFGHIJ";
    setSections([...sections, { id: generateId(), title: `Seksi ${letters[sections.length] ?? sections.length + 1}`, fields: [] }]);
  }
  function removeSection(id: string) { setSections(sections.filter((s) => s.id !== id)); }
  function updateSection(id: string, title: string) { setSections(sections.map((s) => (s.id === id ? { ...s, title } : s))); }
  function moveSection(index: number, dir: 1 | -1) {
    if (index + dir < 0 || index + dir >= sections.length) return;
    const arr = [...sections];
    [arr[index], arr[index + dir]] = [arr[index + dir], arr[index]];
    setSections(arr);
  }

  // ── Field helpers ────────────────────────────────────────────
  function addField(sectionId: string) {
    setSections(sections.map((s) => s.id !== sectionId ? s : {
      ...s, fields: [...s.fields, { id: generateId(), name: "field_" + generateId().slice(0, 5), label: "Label Baru", type: "text" }]
    }));
  }
  function removeField(sid: string, fid: string) {
    setSections(sections.map((s) => s.id !== sid ? s : { ...s, fields: s.fields.filter((f) => f.id !== fid) }));
  }
  function updateField(sid: string, fid: string, updates: Partial<FormField>) {
    setSections(sections.map((s) => s.id !== sid ? s : {
      ...s, fields: s.fields.map((f) => f.id === fid ? { ...f, ...updates } : f)
    }));
  }

  // ── All fields flat (for demo_values editor) ─────────────────
  const allFields = sections.flatMap((s) => s.fields);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-aeonik text-2xl font-bold text-[var(--color-obsidian)]">AI Prompt Studio</h2>
          <p className="text-sm text-[var(--color-silver-pine)]">Bangun generator prompt dinamis untuk user Anda.</p>
        </div>
        {!editingGen && (
          <button onClick={startCreate} className="primary-button flex items-center gap-2">
            <Plus className="h-4 w-4" /> Generator Baru
          </button>
        )}
      </div>

      {editingGen ? (
        <div className="grid gap-6">
          {/* ── Editor Header ── */}
          <div className="flex items-center justify-between rounded-2xl bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-4 shadow-[var(--shadow-md)]">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative">
                <button onClick={() => setShowIconPicker(!showIconPicker)} className="icon-button">
                  <DynamicIcon name={editingGen.icon as string} className="h-5 w-5 text-[var(--color-obsidian)]" />
                </button>
                {showIconPicker && (
                  <div className="absolute top-12 left-0 z-50 p-3 bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 rounded-2xl shadow-[var(--shadow-lg)] border border-[rgba(83,88,98,0.1)] w-64 grid grid-cols-6 gap-2">
                    {Object.keys(ICONS).map(name => (
                      <button key={name} onClick={() => { setEditingGen({...editingGen, icon: name}); setShowIconPicker(false); }} className={`p-2 rounded-xl flex justify-center items-center ${editingGen.icon === name ? 'bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)]' : 'text-[var(--color-silver-pine)] hover:bg-[var(--color-sky-wash)] hover:text-[var(--color-electric-blue)]'}`} title={name}>
                        <DynamicIcon name={name} className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                className="flex-1 bg-transparent font-aeonik text-xl font-bold outline-none"
                value={editingGen.title}
                onChange={(e) => setEditingGen({ ...editingGen, title: e.target.value })}
                placeholder="Nama Generator"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-silver-pine)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingGen.is_published}
                  onChange={(e) => setEditingGen({ ...editingGen, is_published: e.target.checked })}
                  className="rounded"
                />
                Published
              </label>
              <button onClick={saveGen} disabled={saving} className="primary-button flex items-center gap-2">
                <Save className="h-4 w-4" />{saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-1 rounded-xl bg-[var(--color-arctic-mist)] p-1">
            {(["builder", "template", "settings"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg py-2 text-sm font-bold capitalize transition-all ${
                  activeTab === tab ? "bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 shadow text-[var(--color-obsidian)]" : "text-[var(--color-silver-pine)] hover:text-[var(--color-obsidian)]"
                }`}
              >
                {tab === "builder" ? "Form Builder" : tab === "template" ? "Output Template" : "Pengaturan & Demo"}
              </button>
            ))}
          </div>

          {/* ── TAB: Form Builder ── */}
          {activeTab === "builder" && (
            <div className="space-y-4">
              {sections.map((section, sIdx) => (
                <div key={section.id} className="rounded-2xl border border-[rgba(83,88,98,0.12)] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 bg-[var(--color-arctic-mist)] px-4 py-3 border-b border-[rgba(83,88,98,0.08)]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-midnight-ink)] text-white text-xs font-bold">
                      {"ABCDEFGHIJ"[sIdx] ?? sIdx + 1}
                    </div>
                    <input
                      className="flex-1 bg-transparent font-bold text-[var(--color-obsidian)] outline-none text-sm"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, e.target.value)}
                      placeholder="Nama Seksi"
                    />
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="p-1 text-[var(--color-silver-pine)] disabled:opacity-30 hover:text-[var(--color-electric-blue)]"><ChevronUp className="h-4 w-4" /></button>
                      <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === sections.length - 1} className="p-1 text-[var(--color-silver-pine)] disabled:opacity-30 hover:text-[var(--color-electric-blue)]"><ChevronDown className="h-4 w-4" /></button>
                      <button onClick={() => removeSection(section.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {section.fields.map((field) => (
                      <div key={field.id} className="rounded-xl border border-[rgba(83,88,98,0.1)] bg-[var(--color-sky-wash)] p-4 space-y-3">
                        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                          <div>
                            <label className="mb-1 text-xs font-bold text-[var(--color-silver-pine)]">Label UI</label>
                            <input className="form-input text-sm bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10" value={field.label} onChange={(e) => updateField(section.id, field.id, { label: e.target.value })} placeholder="Label yang dilihat user" />
                          </div>
                          <div>
                            <label className="mb-1 text-xs font-bold text-[var(--color-silver-pine)]">Tipe Input</label>
                            <select className="form-input text-sm bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10" value={field.type} onChange={(e) => updateField(section.id, field.id, { type: e.target.value as FormField["type"] })}>
                              {Object.entries(FIELD_TYPE_LABELS).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 text-xs font-bold text-[var(--color-silver-pine)]">Variabel <code className="text-[var(--color-electric-blue)]">{"{{x}}"}</code></label>
                            <input className="form-input text-sm bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 font-mono text-[var(--color-electric-blue)]" value={field.name} onChange={(e) => updateField(section.id, field.id, { name: e.target.value.replace(/[^a-zA-Z0-9_]/g, "") })} placeholder="nama_var" />
                          </div>
                          <div className="flex items-end pb-1">
                            <button onClick={() => removeField(section.id, field.id)} className="p-2 text-[var(--color-silver-pine)] hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                        {/* Select options */}
                        {(field.type === "select") && (
                          <div>
                            <label className="mb-1 text-xs font-bold text-[var(--color-silver-pine)]">Opsi (pisahkan dengan koma)</label>
                            <input className="form-input text-sm bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10" value={field.options || ""} onChange={(e) => updateField(section.id, field.id, { options: e.target.value })} placeholder="Opsi A, Opsi B, Opsi C" />
                          </div>
                        )}
                        {/* Reference URL for select */}
                        {field.type === "select" && (
                          <ImageUploader
                            label="URL Gambar Referensi (opsional — muncul sebagai link &quot;Lihat Referensi&quot; di samping label)"
                            value={field.reference_url || ""}
                            onChange={(val) => updateField(section.id, field.id, { reference_url: val })}
                            placeholder="https://..."
                          />
                        )}
                        {/* Chips hint */}
                        {field.type === "chips" && (
                          <p className="text-xs text-[var(--color-silver-pine)] bg-white/60 rounded-lg px-3 py-2">
                            ✨ <strong>Chips</strong>: User tekan <kbd>Enter</kbd> atau <kbd>,</kbd> untuk menambah tag. Klik × untuk hapus. Value disimpan sebagai teks dipisah koma.
                          </p>
                        )}
                        {/* Color hint */}
                        {field.type === "color" && (
                          <p className="text-xs text-[var(--color-silver-pine)] bg-white/60 rounded-lg px-3 py-2">
                            🎨 <strong>Color Picker</strong>: User memilih warna dari color swatch. Value: kode hex (contoh: <code>#F97316</code>).
                          </p>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addField(section.id)} className="w-full rounded-xl border border-dashed border-[rgba(83,88,98,0.25)] py-2.5 text-sm font-bold text-[var(--color-silver-pine)] hover:border-[var(--color-electric-blue)] hover:text-[var(--color-electric-blue)] transition-colors">
                      + Tambah Kolom Input
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={addSection} className="secondary-button w-full justify-center">
                <Plus className="h-4 w-4 mr-2" /> Tambah Seksi Form
              </button>
            </div>
          )}

          {/* ── TAB: Output Template ── */}
          {activeTab === "template" && (
            <div className="rounded-2xl bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-md)] space-y-4">
              <div className="rounded-xl bg-[var(--color-arctic-mist)] p-4">
                <p className="text-sm font-bold text-[var(--color-obsidian)] mb-2">Variabel yang tersedia dari Form Builder:</p>
                <div className="flex flex-wrap gap-2">
                  {allFields.map((f) => (
                    <span key={f.id} className="font-mono text-xs bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 px-2 py-1 rounded border border-[rgba(0,0,0,0.07)] text-[var(--color-electric-blue)] font-bold cursor-pointer select-all">
                      {`{{${f.name}}}`}
                    </span>
                  ))}
                  {allFields.length === 0 && <span className="text-xs text-[var(--color-silver-pine)]">Belum ada field di Form Builder.</span>}
                </div>
              </div>
              <textarea
                className="form-input min-h-[440px] font-mono text-sm leading-relaxed"
                value={editingGen.prompt_template}
                onChange={(e) => setEditingGen({ ...editingGen, prompt_template: e.target.value })}
                placeholder={`Tulis prompt master Anda di sini...\n\nContoh:\n{\n  "task": "generate_banner",\n  "brand": "{{nama_brand}}",\n  "style": "{{gaya_desain}}"\n}`}
              />
            </div>
          )}

          {/* ── TAB: Settings & Demo ── */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Output Format */}
              <div className="rounded-2xl bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-md)]">
                <h3 className="font-bold text-[var(--color-obsidian)] mb-4 flex items-center gap-2"><Code2 className="h-5 w-5 text-[var(--color-electric-blue)]" /> Format Output</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(["text", "json"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setEditingGen({ ...editingGen, output_format: fmt })}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        editingGen.output_format === fmt
                          ? "border-[var(--color-electric-blue)] bg-[var(--color-whisper-fade-blue)]"
                          : "border-[rgba(83,88,98,0.12)] hover:border-[var(--color-electric-blue)]/50"
                      }`}
                    >
                      <div className="font-bold text-sm capitalize text-[var(--color-obsidian)]">{fmt === "json" ? "JSON (Structured)" : "Plain Text"}</div>
                      <div className="text-xs text-[var(--color-silver-pine)] mt-1">{fmt === "json" ? "Output ditampilkan dengan syntax highlighting JSON" : "Output ditampilkan sebagai teks biasa"}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Image */}
              <div className="rounded-2xl bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-md)]">
                <h3 className="font-bold text-[var(--color-obsidian)] mb-4 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-[var(--color-electric-blue)]" /> Preview Image (Mockup)</h3>
                <ImageUploader
                  label="URL Gambar Preview"
                  value={editingGen.preview_image_url || ""}
                  onChange={(val) => setEditingGen({ ...editingGen, preview_image_url: val })}
                  placeholder="https://... (gambar yang muncul di panel kanan studio user)"
                />
                {editingGen.preview_image_url && (
                  <img src={editingGen.preview_image_url} alt="Preview" className="mt-3 h-32 w-full rounded-xl object-cover border border-[rgba(83,88,98,0.1)]" />
                )}
              </div>

              {/* Demo Values */}
              <div className="rounded-2xl bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-md)]">
                <h3 className="font-bold text-[var(--color-obsidian)] mb-1 flex items-center gap-2">
                  {editingGen.output_format === "json" ? <ToggleRight className="h-5 w-5 text-[var(--color-electric-blue)]" /> : <ToggleLeft className="h-5 w-5 text-[var(--color-electric-blue)]" />}
                  Nilai Demo (Randomize Demo)
                </h3>
                <p className="text-sm text-[var(--color-silver-pine)] mb-4">Isi nilai contoh untuk tiap field. Tombol "Randomize Demo" di Studio user akan auto-mengisi formulir dengan nilai ini.</p>
                {allFields.length === 0 ? (
                  <p className="text-sm text-[var(--color-silver-pine)] italic">Tambahkan field di tab Form Builder terlebih dahulu.</p>
                ) : (
                  <div className="space-y-3">
                    {allFields.map((field) => (
                      <div key={field.id} className="grid grid-cols-[160px_1fr] items-center gap-3">
                        <label className="text-sm font-mono font-bold text-[var(--color-electric-blue)] truncate">{`{{${field.name}}}`}</label>
                        <input
                          className="form-input text-sm"
                          value={(editingGen.demo_values?.[field.name]) || ""}
                          onChange={(e) => setEditingGen({
                            ...editingGen,
                            demo_values: { ...(editingGen.demo_values || {}), [field.name]: e.target.value }
                          })}
                          placeholder={`Contoh nilai untuk "${field.label}"`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Generator List ── */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {generators.length === 0 && (
            <div className="col-span-full rounded-3xl border-2 border-dashed border-[rgba(83,88,98,0.2)] py-16 text-center">
              <p className="font-semibold text-[var(--color-silver-pine)]">Belum ada Generator. Klik "Generator Baru" untuk mulai.</p>
            </div>
          )}
          {generators.map((gen) => (
            <div key={gen.id} className="flex flex-col justify-between rounded-3xl bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-md)] border border-[rgba(83,88,98,0.05)]">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-arctic-mist)] text-[var(--color-electric-blue)]">
                    <DynamicIcon name={gen.icon as string} className="h-5 w-5" />
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${gen.is_published ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {gen.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <h3 className="font-aeonik text-lg font-bold text-[var(--color-obsidian)] line-clamp-1">{gen.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-[var(--color-silver-pine)]">{gen.description || "Tidak ada deskripsi."}</p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-[rgba(83,88,98,0.08)] pt-4">
                <div className="flex gap-2 text-xs font-semibold text-[var(--color-ash-gray)]">
                  <span>{(gen.form_schema as any[])?.length || 0} Seksi</span>
                  <span>·</span>
                  <span className="uppercase">{gen.output_format || "text"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => editGen(gen)} className="icon-button text-[var(--color-electric-blue)]"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => deleteGen(gen.id)} className="icon-button text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
