"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
  Wand,
  Type,
  AlignLeft,
  List,
  Tags,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { PromptGeneratorView } from "@/lib/prompt-data";

type FormField = {
  id: string;
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "tags";
  options?: string; // Comma separated options for select
};

type FormSection = {
  id: string;
  title: string;
  fields: FormField[];
};

type StudioCmsManagerProps = {
  initialGenerators: PromptGeneratorView[];
};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function StudioCmsManager({ initialGenerators }: StudioCmsManagerProps) {
  const [generators, setGenerators] = useState<PromptGeneratorView[]>(initialGenerators);
  const [editingGen, setEditingGen] = useState<PromptGeneratorView | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "template">("builder");

  // Visual Builder State
  const [sections, setSections] = useState<FormSection[]>([]);

  function startCreate() {
    setEditingGen({
      id: "",
      title: "Generator Baru",
      description: "",
      icon: "wand",
      form_schema: [],
      prompt_template: "Ganti teks ini dengan template prompt Anda...",
      is_published: false,
      created_at: new Date().toISOString(),
    });
    setSections([{ id: generateId(), title: "Seksi 1", fields: [] }]);
    setActiveTab("builder");
  }

  function editGen(gen: PromptGeneratorView) {
    setEditingGen(gen);
    setSections(gen.form_schema || []);
    setActiveTab("builder");
  }

  async function deleteGen(id: string) {
    if (!supabase) return;
    if (!window.confirm("Yakin ingin menghapus generator ini?")) return;
    const { error } = await supabase.from("prompt_generators").delete().eq("id", id);
    if (!error) {
      setGenerators((prev) => prev.filter((g) => g.id !== id));
    } else {
      alert("Error: " + error.message);
    }
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
    };

    let result;
    if (editingGen.id) {
      result = await supabase.from("prompt_generators").update(payload).eq("id", editingGen.id).select().single();
    } else {
      result = await supabase.from("prompt_generators").insert(payload).select().single();
    }

    setSaving(false);
    
    if (result.error) {
      alert("Error saving: " + result.error.message);
      return;
    }

    const savedData = result.data as PromptGeneratorView;
    
    if (editingGen.id) {
      setGenerators((prev) => prev.map((g) => (g.id === savedData.id ? savedData : g)));
    } else {
      setGenerators([savedData, ...generators]);
    }
    
    setEditingGen(null);
  }

  function addSection() {
    setSections([...sections, { id: generateId(), title: "Seksi Baru", fields: [] }]);
  }

  function removeSection(id: string) {
    setSections(sections.filter(s => s.id !== id));
  }

  function updateSection(id: string, title: string) {
    setSections(sections.map(s => s.id === id ? { ...s, title } : s));
  }

  function addField(sectionId: string) {
    setSections(sections.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        fields: [...s.fields, { id: generateId(), name: "field_" + generateId(), label: "Label Baru", type: "text" }]
      };
    }));
  }

  function removeField(sectionId: string, fieldId: string) {
    setSections(sections.map(s => {
      if (s.id !== sectionId) return s;
      return { ...s, fields: s.fields.filter(f => f.id !== fieldId) };
    }));
  }

  function updateField(sectionId: string, fieldId: string, updates: Partial<FormField>) {
    setSections(sections.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        fields: s.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
      };
    }));
  }

  function moveSection(index: number, direction: 1 | -1) {
    if (index + direction < 0 || index + direction >= sections.length) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + direction];
    newSections[index + direction] = temp;
    setSections(newSections);
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-aeonik text-2xl font-bold tracking-tight text-[var(--color-obsidian)]">
            AI Prompt Studio
          </h2>
          <p className="text-sm text-[var(--color-silver-pine)]">
            Bangun formulir generator dinamis untuk memanjakan pengguna Anda.
          </p>
        </div>
        {!editingGen && (
          <button onClick={startCreate} className="primary-button flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Generator Baru
          </button>
        )}
      </div>

      {editingGen ? (
        <div className="grid gap-6">
          {/* Header Editor */}
          <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-[var(--shadow-md)]">
            <div className="flex flex-1 items-center gap-4">
              <button onClick={() => setEditingGen(null)} className="icon-button" title="Kembali">
                <X className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <input
                  className="w-full bg-transparent font-aeonik text-xl font-bold outline-none"
                  value={editingGen.title}
                  onChange={(e) => setEditingGen({ ...editingGen, title: e.target.value })}
                  placeholder="Nama Generator"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-silver-pine)]">
                <input
                  type="checkbox"
                  checked={editingGen.is_published}
                  onChange={(e) => setEditingGen({ ...editingGen, is_published: e.target.checked })}
                  className="rounded border-[rgba(83,88,98,0.2)] text-[var(--color-electric-blue)] focus:ring-[var(--color-electric-blue)]"
                />
                Published
              </label>
              <button onClick={saveGen} disabled={saving} className="primary-button">
                {saving ? "Menyimpan..." : <><Save className="h-4 w-4" /> Simpan</>}
              </button>
            </div>
          </div>

          {/* Description & Icon */}
          <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
            <div className="grid gap-4 md:grid-cols-[1fr_200px]">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-[var(--color-obsidian)]">Deskripsi Singkat</label>
                <input
                  className="form-input"
                  value={editingGen.description}
                  onChange={(e) => setEditingGen({ ...editingGen, description: e.target.value })}
                  placeholder="Contoh: Isi detail produk untuk menghasilkan prompt JSON siap pakai."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-[var(--color-obsidian)]">Ikon (opsional)</label>
                <input
                  className="form-input"
                  value={editingGen.icon}
                  onChange={(e) => setEditingGen({ ...editingGen, icon: e.target.value })}
                  placeholder="wand, image, text..."
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[rgba(83,88,98,0.1)]">
            <button
              onClick={() => setActiveTab("builder")}
              className={`px-6 py-3 text-sm font-bold transition-colors ${
                activeTab === "builder"
                  ? "border-b-2 border-[var(--color-electric-blue)] text-[var(--color-electric-blue)]"
                  : "text-[var(--color-silver-pine)] hover:text-[var(--color-obsidian)]"
              }`}
            >
              Form Builder (Visual)
            </button>
            <button
              onClick={() => setActiveTab("template")}
              className={`px-6 py-3 text-sm font-bold transition-colors ${
                activeTab === "template"
                  ? "border-b-2 border-[var(--color-electric-blue)] text-[var(--color-electric-blue)]"
                  : "text-[var(--color-silver-pine)] hover:text-[var(--color-obsidian)]"
              }`}
            >
              Output Template (Prompt)
            </button>
          </div>

          {/* Tab Content: Form Builder */}
          {activeTab === "builder" && (
            <div className="space-y-6">
              {sections.map((section, sIndex) => (
                <div key={section.id} className="rounded-2xl border border-[rgba(83,88,98,0.15)] bg-white overflow-hidden shadow-sm">
                  {/* Section Header */}
                  <div className="flex items-center gap-3 bg-[var(--color-arctic-mist)] p-4 border-b border-[rgba(83,88,98,0.1)]">
                    <div className="flex flex-col">
                      <button onClick={() => moveSection(sIndex, -1)} className="text-[var(--color-silver-pine)] hover:text-[var(--color-electric-blue)] disabled:opacity-30" disabled={sIndex === 0}><ChevronUp className="h-4 w-4" /></button>
                      <button onClick={() => moveSection(sIndex, 1)} className="text-[var(--color-silver-pine)] hover:text-[var(--color-electric-blue)] disabled:opacity-30" disabled={sIndex === sections.length - 1}><ChevronDown className="h-4 w-4" /></button>
                    </div>
                    <input
                      className="flex-1 bg-transparent font-bold text-[var(--color-obsidian)] outline-none"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, e.target.value)}
                      placeholder="Nama Seksi (Misal: Seksi A - Informasi Produk)"
                    />
                    <button onClick={() => removeSection(section.id)} className="icon-button text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>

                  {/* Fields */}
                  <div className="p-4 space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.id} className="grid gap-3 rounded-xl border border-[rgba(83,88,98,0.1)] bg-[var(--color-sky-wash)] p-4 sm:grid-cols-[2fr_1fr_1fr_auto]">
                        <div>
                          <label className="mb-1 text-xs font-bold text-[var(--color-silver-pine)]">Label UI</label>
                          <input className="form-input text-sm" value={field.label} onChange={(e) => updateField(section.id, field.id, { label: e.target.value })} placeholder="Label yang dilihat user" />
                        </div>
                        <div>
                          <label className="mb-1 text-xs font-bold text-[var(--color-silver-pine)]">Tipe Input</label>
                          <select className="form-input text-sm" value={field.type} onChange={(e) => updateField(section.id, field.id, { type: e.target.value as any })}>
                            <option value="text">Teks Pendek</option>
                            <option value="textarea">Teks Panjang</option>
                            <option value="select">Pilihan (Select)</option>
                            <option value="tags">Tags (Koma)</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 text-xs font-bold text-[var(--color-silver-pine)]">Variabel Template</label>
                          <input className="form-input text-sm font-mono text-[var(--color-electric-blue)]" value={field.name} onChange={(e) => updateField(section.id, field.id, { name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })} placeholder="nama_variabel" />
                        </div>
                        <div className="flex items-end pb-1">
                          <button onClick={() => removeField(section.id, field.id)} className="p-2 text-[var(--color-silver-pine)] hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        
                        {/* Options for Select */}
                        {field.type === "select" && (
                          <div className="sm:col-span-4 mt-2">
                            <label className="mb-1 text-xs font-bold text-[var(--color-silver-pine)]">Opsi Pilihan (Pisahkan dengan koma)</label>
                            <input className="form-input text-sm" value={field.options || ""} onChange={(e) => updateField(section.id, field.id, { options: e.target.value })} placeholder="Opsi A, Opsi B, Opsi C..." />
                          </div>
                        )}
                      </div>
                    ))}

                    <button onClick={() => addField(section.id)} className="w-full rounded-xl border border-dashed border-[rgba(83,88,98,0.3)] py-3 text-sm font-bold text-[var(--color-silver-pine)] hover:border-[var(--color-electric-blue)] hover:bg-[var(--color-arctic-mist)] hover:text-[var(--color-electric-blue)] transition-colors">
                      + Tambah Kolom Input
                    </button>
                  </div>
                </div>
              ))}
              
              <button onClick={addSection} className="secondary-button w-full justify-center border-dashed">
                <Plus className="h-4 w-4 mr-2" /> Tambah Seksi Form
              </button>
            </div>
          )}

          {/* Tab Content: Output Template */}
          {activeTab === "template" && (
            <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
              <div className="mb-4 rounded-xl bg-[var(--color-arctic-mist)] p-4">
                <h4 className="font-bold text-[var(--color-obsidian)] text-sm mb-1">Cara menggunakan variabel:</h4>
                <p className="text-sm text-[var(--color-silver-pine)]">Bungkus nama variabel (kolom ke-3 pada Form Builder) dengan kurung kurawal ganda: <code className="bg-white px-1.5 py-0.5 rounded text-[var(--color-electric-blue)] font-bold">{`{{nama_variabel}}`}</code>. Saat digenerate, teks ini akan otomatis diganti dengan isian user.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sections.flatMap(s => s.fields).map(f => (
                    <span key={f.id} className="text-xs font-mono font-semibold text-[var(--color-obsidian)] bg-white px-2 py-1 rounded border border-[rgba(0,0,0,0.05)] cursor-default">
                      {`{{${f.name}}}`}
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                className="form-input min-h-[400px] font-mono text-sm leading-relaxed"
                value={editingGen.prompt_template}
                onChange={(e) => setEditingGen({ ...editingGen, prompt_template: e.target.value })}
                placeholder="Tulis prompt master Anda di sini..."
              />
            </div>
          )}

        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {generators.length === 0 && (
            <div className="col-span-full rounded-3xl border-2 border-dashed border-[rgba(83,88,98,0.2)] py-16 text-center">
              <p className="font-semibold text-[var(--color-silver-pine)]">Belum ada Generator yang dibuat.</p>
            </div>
          )}
          {generators.map((gen) => (
            <div key={gen.id} className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-[var(--shadow-md)] border border-[rgba(83,88,98,0.05)]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-arctic-mist)] text-[var(--color-electric-blue)]">
                    <Wand className="h-5 w-5" />
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${gen.is_published ? 'bg-[var(--color-mint-glaze)] text-[var(--color-silver-pine)]' : 'bg-[var(--color-whisper-fade-orange)] text-[var(--color-zesty-orange)]'}`}>
                    {gen.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h3 className="font-aeonik text-lg font-bold text-[var(--color-obsidian)] line-clamp-1">{gen.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--color-silver-pine)] leading-relaxed">
                  {gen.description || "Tidak ada deskripsi"}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-[rgba(83,88,98,0.1)] pt-4">
                <span className="text-xs font-semibold text-[var(--color-ash-gray)]">
                  {gen.form_schema?.length || 0} Seksi Form
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => editGen(gen)} className="icon-button text-[var(--color-electric-blue)] hover:bg-[var(--color-arctic-mist)]"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => deleteGen(gen.id)} className="icon-button text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
