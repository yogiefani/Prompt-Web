"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Loader2, Save, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { PromptCategoryView, PromptView } from "@/lib/prompt-data";

type PromptCmsManagerProps = {
  initialCategories: PromptCategoryView[];
  initialPrompts: PromptView[];
  source: "supabase" | "fallback";
};

type CategoryFormState = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

type PromptFormState = {
  id: string;
  title: string;
  categoryId: string;
  model: string;
  tagsText: string;
  body: string;
  isPublished: boolean;
};

const emptyCategory: CategoryFormState = {
  id: "",
  name: "",
  slug: "",
  description: "",
};

function createEmptyPrompt(categoryId = ""): PromptFormState {
  return {
    id: "",
    title: "",
    categoryId,
    model: "All AI",
    tagsText: "",
    body: "",
    isPublished: true,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function parseTags(tagsText: string) {
  return tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function PromptCmsManager({ initialCategories, initialPrompts, source }: PromptCmsManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [prompts, setPrompts] = useState(initialPrompts);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategory);
  const [promptForm, setPromptForm] = useState<PromptFormState>(
    createEmptyPrompt(initialCategories[0]?.id ?? ""),
  );
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [message, setMessage] = useState("");

  const isReady = isSupabaseConfigured && source === "supabase" && Boolean(supabase);
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === promptForm.categoryId),
    [categories, promptForm.categoryId],
  );
  interface ImportedPrompt {
    title?: string;
    body?: string;
    category?: string;
    category_slug?: string;
    model?: string;
    ai_model?: string;
    tags?: string | string[];
    published?: boolean | string | number;
  }

  interface SupabasePromptRow {
    id: string;
    category_id: string;
    title: string;
    body: string;
    ai_model: string | null;
    tags: string[] | null;
    is_published: boolean | null;
    variables?: Record<string, string> | null;
  }

  async function handleBulkImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isReady || !supabase) {
      setMessage("Supabase belum siap untuk bulk import.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const text = await file.text();
      let importedPrompts: ImportedPrompt[] = [];

      if (file.name.endsWith(".json")) {
        const parsed = JSON.parse(text);
        importedPrompts = Array.isArray(parsed) ? parsed : [parsed];
      } else if (file.name.endsWith(".csv")) {
        importedPrompts = parseCsv(text);
      } else {
        throw new Error("Format berkas tidak didukung. Harap pilih berkas .csv atau .json");
      }

      if (importedPrompts.length === 0) {
        throw new Error("Tidak ada baris prompt valid yang terbaca.");
      }

      const payloads = importedPrompts.map((item) => {
        const title = (item.title || "").trim();
        const body = (item.body || "").trim();
        const categoryStr = (item.category || item.category_slug || "").trim().toLowerCase();

        const cat = categories.find(
          (c) => c.slug === categoryStr || c.name.toLowerCase() === categoryStr
        ) ?? categories[0];

        const model = (item.model || item.ai_model || "All AI").trim();
        const tags = Array.isArray(item.tags)
          ? item.tags
          : typeof item.tags === "string"
          ? item.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : [];

        const isPublished = item.published !== undefined
          ? (item.published === true || String(item.published).toLowerCase() === "true" || String(item.published) === "1")
          : true;

        if (!title || !body) {
          throw new Error("Judul (title) dan isi (body) prompt tidak boleh kosong.");
        }

        return {
          title,
          body,
          category_id: cat ? cat.id : null,
          ai_model: model,
          tags,
          is_published: isPublished,
          updated_at: new Date().toISOString(),
        };
      });

      const { data, error } = await supabase
        .from("prompts")
        .insert(payloads)
        .select("id,category_id,title,body,ai_model,tags,is_published,variables");

      if (error) throw error;

      const newPrompts = ((data as SupabasePromptRow[] | null) ?? []).map((row) => {
        const category = categories.find((c) => c.id === row.category_id);
        return {
          id: row.id,
          title: row.title,
          categoryId: row.category_id,
          category: category?.name ?? "Uncategorized",
          categorySlug: category?.slug ?? "uncategorized",
          model: row.ai_model ?? "All AI",
          tags: row.tags ?? [],
          body: row.body,
          isPublished: row.is_published ?? false,
          variables: row.variables ?? {},
        };
      });

      setPrompts((current) => [...newPrompts, ...current]);
      setMessage(`Sukses mengimpor ${newPrompts.length} prompt baru.`);
      router.refresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setMessage(`Gagal mengimpor berkas: ${errorMsg}`);
    } finally {
      setStatus("idle");
      event.target.value = "";
    }
  }

  function parseCsv(text: string): Record<string, string>[] {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const parseLine = (line: string) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current);
      return result.map((v) => v.replace(/^"|"$/g, "").trim());
    };

    const headers = parseLine(lines[0] || "").map((h) => h.toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i] || "");
      const obj: Record<string, string> = {};
      headers.forEach((header, idx) => {
        obj[header] = values[idx] ?? "";
      });
      data.push(obj);
    }
    return data;
  }

  function updateCategoryName(name: string) {
    setCategoryForm((current) => ({
      ...current,
      name,
      slug: current.id ? current.slug : slugify(name),
    }));
  }

  function editCategory(category: PromptCategoryView) {
    setCategoryForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
    });
  }

  function resetCategoryForm() {
    setCategoryForm(emptyCategory);
  }

  function editPrompt(prompt: PromptView) {
    setPromptForm({
      id: prompt.id,
      title: prompt.title,
      categoryId: prompt.categoryId,
      model: prompt.model,
      tagsText: prompt.tags.join(", "),
      body: prompt.body,
      isPublished: prompt.isPublished,
    });
  }

  function resetPromptForm() {
    setPromptForm(createEmptyPrompt(categories[0]?.id ?? ""));
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!isReady || !supabase) {
      setMessage("Supabase belum siap. Isi .env.local, login sebagai superadmin, lalu jalankan schema SQL.");
      return;
    }

    setStatus("loading");

    const payload = {
      name: categoryForm.name.trim(),
      slug: slugify(categoryForm.slug || categoryForm.name),
      description: categoryForm.description.trim(),
      updated_at: new Date().toISOString(),
    };

    const result = categoryForm.id
      ? await supabase
          .from("prompt_categories")
          .update(payload)
          .eq("id", categoryForm.id)
          .select("id,name,slug,description")
          .single()
      : await supabase
          .from("prompt_categories")
          .insert({ ...payload, sort_order: categories.length + 1 })
          .select("id,name,slug,description")
          .single();

    setStatus("idle");

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    const savedCategory: PromptCategoryView = {
      id: result.data.id,
      name: result.data.name,
      slug: result.data.slug,
      description: result.data.description ?? "",
      iconName: "folder",
    };

    setCategories((current) =>
      categoryForm.id
        ? current.map((category) => (category.id === savedCategory.id ? savedCategory : category))
        : [...current, savedCategory],
    );
    resetCategoryForm();
    setMessage("Kategori berhasil disimpan.");
    router.refresh();
  }

  async function deleteCategory(category: PromptCategoryView) {
    if (!isReady || !supabase) {
      setMessage("Supabase belum siap untuk delete kategori.");
      return;
    }

    const confirmed = window.confirm(`Hapus kategori "${category.name}"?`);
    if (!confirmed) return;

    setStatus("loading");
    const { error } = await supabase.from("prompt_categories").delete().eq("id", category.id);
    setStatus("idle");

    if (error) {
      setMessage(error.message);
      return;
    }

    setCategories((current) => current.filter((item) => item.id !== category.id));
    setMessage("Kategori berhasil dihapus.");
    router.refresh();
  }

  async function savePrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!isReady || !supabase) {
      setMessage("Supabase belum siap. Isi .env.local, login sebagai superadmin, lalu jalankan schema SQL.");
      return;
    }

    setStatus("loading");

    const payload = {
      title: promptForm.title.trim(),
      category_id: promptForm.categoryId,
      ai_model: promptForm.model.trim() || "All AI",
      tags: parseTags(promptForm.tagsText),
      body: promptForm.body.trim(),
      is_published: promptForm.isPublished,
      updated_at: new Date().toISOString(),
    };

    const result = promptForm.id
      ? await supabase
          .from("prompts")
          .update(payload)
          .eq("id", promptForm.id)
          .select("id,category_id,title,body,ai_model,tags,is_published,variables")
          .single()
      : await supabase
          .from("prompts")
          .insert(payload)
          .select("id,category_id,title,body,ai_model,tags,is_published,variables")
          .single();

    setStatus("idle");

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    const category = categories.find((item) => item.id === result.data.category_id);
    const savedPrompt: PromptView = {
      id: result.data.id,
      title: result.data.title,
      categoryId: result.data.category_id,
      category: category?.name ?? "Uncategorized",
      categorySlug: category?.slug ?? "uncategorized",
      model: result.data.ai_model ?? "All AI",
      tags: result.data.tags ?? [],
      body: result.data.body,
      isPublished: result.data.is_published ?? false,
      variables: result.data.variables ?? {},
    };

    setPrompts((current) =>
      promptForm.id
        ? current.map((prompt) => (prompt.id === savedPrompt.id ? savedPrompt : prompt))
        : [savedPrompt, ...current],
    );
    resetPromptForm();
    setMessage("Prompt berhasil disimpan.");
    router.refresh();
  }

  async function deletePrompt(prompt: PromptView) {
    if (!isReady || !supabase) {
      setMessage("Supabase belum siap untuk delete prompt.");
      return;
    }

    const confirmed = window.confirm(`Hapus prompt "${prompt.title}"?`);
    if (!confirmed) return;

    setStatus("loading");
    const { error } = await supabase.from("prompts").delete().eq("id", prompt.id);
    setStatus("idle");

    if (error) {
      setMessage(error.message);
      return;
    }

    setPrompts((current) => current.filter((item) => item.id !== prompt.id));
    setMessage("Prompt berhasil dihapus.");
    router.refresh();
  }

  return (
    <section className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-lg)] md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-aeonik text-2xl tracking-[-0.02em]">Prompt CMS</h2>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[var(--color-silver-pine)]">
            Kelola kategori dan prompt dari Supabase. RLS tetap membatasi operasi tulis hanya untuk role superadmin.
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-sky-wash)] px-4 py-2 text-xs font-semibold text-[var(--color-electric-blue)]">
          {isReady ? "Supabase write ready" : "Supabase not connected"}
        </span>
      </div>

      {message ? (
        <div className="mt-5 rounded-2xl bg-[var(--color-whisper-fade-yellow)] px-4 py-3 text-sm font-semibold leading-6 text-[var(--color-silver-pine)]">
          {message}
        </div>
      ) : null}

      {/* Bulk Import UI */}
      {isReady && (
        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[rgba(83,88,98,0.12)] bg-[var(--color-sky-wash)]/20 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-[var(--color-obsidian)]">Bulk Import Prompt</h3>
            <p className="mt-1 text-xs font-medium text-[var(--color-silver-pine)]">
              Unggah file CSV (kolom: title, body, category, model, tags, published) atau JSON untuk menambah banyak prompt sekaligus.
            </p>
          </div>
          <label className="secondary-button cursor-pointer">
            Pilih Berkas (.csv, .json)
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleBulkImport}
              className="hidden"
              disabled={status === "loading"}
            />
          </label>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <form className="rounded-[28px] bg-[var(--color-arctic-mist)] p-5" onSubmit={saveCategory}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-aeonik text-xl tracking-[-0.02em]">
              {categoryForm.id ? "Edit Kategori" : "Kategori Baru"}
            </h3>
            {categoryForm.id ? (
              <button className="secondary-button" type="button" onClick={resetCategoryForm}>
                Reset
              </button>
            ) : null}
          </div>

          <div className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">
              Nama
              <input
                className="form-input mt-2"
                value={categoryForm.name}
                onChange={(event) => updateCategoryName(event.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-semibold">
              Slug
              <input
                className="form-input mt-2"
                value={categoryForm.slug}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, slug: slugify(event.target.value) }))
                }
                required
              />
            </label>
            <label className="block text-sm font-semibold">
              Deskripsi
              <textarea
                className="admin-textarea mt-2"
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={4}
              />
            </label>
            <button className="primary-button w-full" type="submit" disabled={status === "loading"}>
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Kategori
            </button>
          </div>

          <div className="mt-6 space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
                <div>
                  <p className="text-sm font-semibold">{category.name}</p>
                  <p className="text-xs font-medium text-[var(--color-ash-gray)]">{category.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-button" type="button" title="Edit category" onClick={() => editCategory(category)}>
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button className="icon-button" type="button" title="Delete category" onClick={() => deleteCategory(category)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </form>

        <div className="rounded-[28px] bg-[var(--color-arctic-mist)] p-5">
          <form onSubmit={savePrompt}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-aeonik text-xl tracking-[-0.02em]">
                {promptForm.id ? "Edit Prompt" : "Prompt Baru"}
              </h3>
              {promptForm.id ? (
                <button className="secondary-button" type="button" onClick={resetPromptForm}>
                  Reset
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold">
                Judul
                <input
                  className="form-input mt-2"
                  value={promptForm.title}
                  onChange={(event) => setPromptForm((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </label>
              <label className="block text-sm font-semibold">
                Kategori
                <select
                  className="admin-select mt-2"
                  value={promptForm.categoryId}
                  onChange={(event) =>
                    setPromptForm((current) => ({ ...current, categoryId: event.target.value }))
                  }
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Model AI
                <input
                  className="form-input mt-2"
                  value={promptForm.model}
                  onChange={(event) => setPromptForm((current) => ({ ...current, model: event.target.value }))}
                />
              </label>
              <label className="block text-sm font-semibold">
                Tags
                <input
                  className="form-input mt-2"
                  placeholder="content, research, gpt"
                  value={promptForm.tagsText}
                  onChange={(event) => setPromptForm((current) => ({ ...current, tagsText: event.target.value }))}
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-semibold">
              Prompt
              <textarea
                className="admin-textarea mt-2"
                value={promptForm.body}
                onChange={(event) => setPromptForm((current) => ({ ...current, body: event.target.value }))}
                rows={7}
                required
              />
            </label>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label className="flex items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={promptForm.isPublished}
                  onChange={(event) =>
                    setPromptForm((current) => ({ ...current, isPublished: event.target.checked }))
                  }
                />
                Published
              </label>
              <button className="primary-button" type="submit" disabled={status === "loading" || !selectedCategory}>
                {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Prompt
              </button>
            </div>
          </form>

          <div className="mt-6 overflow-hidden rounded-2xl border border-[rgba(83,88,98,0.14)] bg-white">
            {prompts.map((prompt) => (
              <motion.div
                layout
                key={prompt.id}
                className="grid gap-3 border-b border-[rgba(83,88,98,0.1)] p-4 last:border-b-0 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[var(--color-obsidian)]">{prompt.title}</p>
                    <span className="rounded-full bg-[var(--color-sky-wash)] px-3 py-1 text-xs font-semibold text-[var(--color-electric-blue)]">
                      {prompt.category}
                    </span>
                    <span className="rounded-full bg-[var(--color-mint-glaze)] px-3 py-1 text-xs font-semibold text-[var(--color-silver-pine)]">
                      {prompt.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-[var(--color-silver-pine)]">
                    {prompt.body}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-button" type="button" title="Edit prompt" onClick={() => editPrompt(prompt)}>
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button className="icon-button" type="button" title="Delete prompt" onClick={() => deletePrompt(prompt)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
