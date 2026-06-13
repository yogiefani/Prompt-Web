"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Check,
  Compass,
  Copy,
  Filter,
  Folder,
  FolderKanban,
  Grid2X2,
  LayoutList,
  MessageSquareText,
  Plus,
  Search,
  Sparkles,
  Star,
  WandSparkles,
  SlidersHorizontal,
} from "lucide-react";
import type { IconName, PromptCategoryView, PromptView } from "@/lib/prompt-data";
import { supabase } from "@/lib/supabase";

const iconMap: Record<IconName, typeof Sparkles> = {
  "bar-chart": Sparkles,
  book: Sparkles,
  bot: Bot,
  compass: Compass,
  file: Sparkles,
  folder: FolderKanban,
  message: MessageSquareText,
  search: Search,
  sparkles: Sparkles,
  wand: WandSparkles,
};

function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\[([^\]]+)\]/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
}

type PromptLibraryProps = {
  categories: PromptCategoryView[];
  prompts: PromptView[];
  source: "supabase" | "fallback";
};

export function PromptLibrary({ categories, prompts, source }: PromptLibraryProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [copiedTitle, setCopiedTitle] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>({});
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [collectionItems, setCollectionItems] = useState<Record<string, Set<string>>>({});
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("All");
  const [showAddToCollectionId, setShowAddToCollectionId] = useState<string>("");
  const [newCollectionName, setNewCollectionName] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedModel, setSelectedModel] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");

  const searchParams = useSearchParams();
  const router = useRouter();
  const urlPromptId = searchParams.get("prompt");

  useEffect(() => {
    if (urlPromptId && prompts.length > 0) {
      const target = prompts.find(p => p.id === urlPromptId);
      if (target) {
        setQuery(target.title);
        setActiveCategory("All");
        // ✅ Bersihkan URL param secara diam-diam tanpa reload halaman
        router.replace("/library", { scroll: false });
      }
    }
  }, [urlPromptId, prompts]);

  const uniqueModels = useMemo(() => {
    const models = new Set<string>();
    prompts.forEach((p) => {
      if (p.model) models.add(p.model);
    });
    return ["All", ...Array.from(models)];
  }, [prompts]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    prompts.forEach((p) => {
      p.tags.forEach((t) => tags.add(t));
    });
    return ["All", ...Array.from(tags)];
  }, [prompts]);

  function escapeHtml(text: string): string {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getRenderedBody(body: string, promptId: string) {
    let finalBody = escapeHtml(body);
    const placeholders = extractPlaceholders(body);
    const promptInputs = inputs[promptId] ?? {};

    placeholders.forEach((placeholder) => {
      const userValue = promptInputs[placeholder]?.trim();
      const escapedPlaceholder = escapeHtml(`[${placeholder}]`);
      
      let replacement = "";
      if (userValue) {
        replacement = `<span class="bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)] px-1.5 py-0.5 rounded-lg border border-[rgba(0,105,224,0.12)] font-bold">${escapeHtml(userValue)}</span>`;
      } else {
        replacement = `<span class="bg-[var(--color-whisper-fade-orange)] text-[var(--color-zesty-orange)] px-1.5 py-0.5 rounded-lg border border-[rgba(242,97,16,0.12)] font-bold">[${escapeHtml(placeholder)}]</span>`;
      }

      finalBody = finalBody.replaceAll(escapedPlaceholder, replacement);
    });

    return finalBody;
  }

  useEffect(() => {
    let isMounted = true;

    async function loadFavoritesAndCollections() {
      if (source !== "supabase" || !supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted || !user) return;

      setUserId(user.id);

      const { data: favs } = await supabase
        .from("prompt_favorites")
        .select("prompt_id")
        .eq("user_id", user.id);

      if (isMounted && favs) {
        setFavoriteIds(new Set(favs.map((f) => f.prompt_id as string)));
      }

      const { data: cols } = await supabase
        .from("prompt_collections")
        .select("id, name")
        .eq("user_id", user.id);

      if (isMounted && cols) {
        setCollections(cols);

        const colIds = cols.map((c) => c.id);
        if (colIds.length > 0) {
          const { data: items } = await supabase
            .from("prompt_collection_items")
            .select("collection_id, prompt_id")
            .in("collection_id", colIds);

          if (isMounted && items) {
            const mapping: Record<string, Set<string>> = {};
            items.forEach((item) => {
              if (!mapping[item.prompt_id]) {
                mapping[item.prompt_id] = new Set();
              }
              mapping[item.prompt_id].add(item.collection_id);
            });
            setCollectionItems(mapping);
          }
        }
      }
    }

    loadFavoritesAndCollections();

    return () => {
      isMounted = false;
    };
  }, [source]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesCategory =
        activeCategory === "All" ||
        prompt.category.toLowerCase().includes(activeCategory.toLowerCase());
      const matchesFavorite = !favoritesOnly || favoriteIds.has(prompt.id);
      const matchesCollection =
        selectedCollectionId === "All" ||
        collectionItems[prompt.id]?.has(selectedCollectionId);
      const matchesModel =
        selectedModel === "All" ||
        prompt.model.toLowerCase() === selectedModel.toLowerCase();
      const matchesTag =
        selectedTag === "All" ||
        prompt.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
      const haystack = [prompt.title, prompt.category, prompt.body, prompt.model, ...prompt.tags]
        .join(" ")
        .toLowerCase();

      return (
        matchesCategory &&
        matchesFavorite &&
        matchesCollection &&
        matchesModel &&
        matchesTag &&
        haystack.includes(query.toLowerCase())
      );
    });
  }, [
    activeCategory,
    favoriteIds,
    favoritesOnly,
    selectedCollectionId,
    collectionItems,
    selectedModel,
    selectedTag,
    prompts,
    query,
  ]);

  async function copyPrompt(prompt: PromptView) {
    let finalBody = prompt.body;
    const placeholders = extractPlaceholders(prompt.body);
    const promptInputs = inputs[prompt.id] ?? {};

    placeholders.forEach((placeholder) => {
      const userValue = promptInputs[placeholder]?.trim();
      if (userValue) {
        const escapedVar = placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        const regex = new RegExp(`\\[${escapedVar}\\]`, "g");
        finalBody = finalBody.replace(regex, userValue);
      }
    });

    await navigator.clipboard.writeText(finalBody);
    setCopiedTitle(prompt.title);
    window.setTimeout(() => setCopiedTitle(""), 1600);

    if (source === "supabase" && supabase && userId) {
      await supabase.from("prompt_copy_events").insert({
        user_id: userId,
        prompt_id: prompt.id,
      });
    }
  }

  async function toggleFavorite(promptId: string) {
    const wasFavorite = favoriteIds.has(promptId);

    setFavoriteIds((current) => {
      const next = new Set(current);

      if (wasFavorite) {
        next.delete(promptId);
      } else {
        next.add(promptId);
      }

      return next;
    });

    if (source !== "supabase" || !supabase || !userId) return;

    const result = wasFavorite
      ? await supabase
          .from("prompt_favorites")
          .delete()
          .eq("user_id", userId)
          .eq("prompt_id", promptId)
      : await supabase.from("prompt_favorites").insert({
          user_id: userId,
          prompt_id: promptId,
        });

    if (result.error) {
      setFavoriteIds((current) => {
        const next = new Set(current);

        if (wasFavorite) {
          next.add(promptId);
        } else {
          next.delete(promptId);
        }

        return next;
      });
    }
  }

  async function createCollection(name: string) {
    if (!userId || !supabase || !name.trim()) return;

    const { data, error } = await supabase
      .from("prompt_collections")
      .insert({ user_id: userId, name: name.trim() })
      .select("id, name")
      .single();

    if (error || !data) return;

    setCollections((prev) => [...prev, data]);
    setNewCollectionName("");
  }

  async function deleteCollection(id: string) {
    if (!supabase) return;
    const confirmed = window.confirm("Hapus koleksi ini?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("prompt_collections")
      .delete()
      .eq("id", id);

    if (error) return;

    setCollections((prev) => prev.filter((c) => c.id !== id));
    if (selectedCollectionId === id) {
      setSelectedCollectionId("All");
    }
  }

  async function togglePromptInCollection(promptId: string, collectionId: string) {
    if (!supabase) return;

    const isMember = collectionItems[promptId]?.has(collectionId);

    setCollectionItems((prev) => {
      const next = { ...prev };
      if (!next[promptId]) {
        next[promptId] = new Set();
      }
      if (isMember) {
        next[promptId].delete(collectionId);
      } else {
        next[promptId].add(collectionId);
      }
      return next;
    });

    const result = isMember
      ? await supabase
          .from("prompt_collection_items")
          .delete()
          .eq("collection_id", collectionId)
          .eq("prompt_id", promptId)
      : await supabase.from("prompt_collection_items").insert({
          collection_id: collectionId,
          prompt_id: promptId,
        });

    if (result.error) {
      setCollectionItems((prev) => {
        const next = { ...prev };
        if (!next[promptId]) {
          next[promptId] = new Set();
        }
        if (isMember) {
          next[promptId].add(collectionId);
        } else {
          next[promptId].delete(collectionId);
        }
        return next;
      });
    }
  }

  return (
    <section className="space-y-6">
      <motion.div
        className="flex flex-col gap-4 rounded-[32px] bg-white p-4 shadow-[var(--shadow-lg)]"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-full border border-[rgba(83,88,98,0.16)] bg-[var(--color-arctic-mist)] px-4 py-3">
            <Search className="h-4 w-4 text-[var(--color-silver-pine)]" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari prompt, tag, kategori, atau model AI..."
              className="w-full bg-transparent text-sm font-medium tracking-[-0.01em] text-[var(--color-obsidian)] outline-none placeholder:text-[var(--color-ash-gray)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setFavoritesOnly((current) => !current)}
              className={`icon-button ${favoritesOnly ? "active" : ""}`}
              type="button"
              title="Tampilkan Favorit"
            >
              <Star className="h-4 w-4" fill={favoritesOnly ? "currentColor" : "none"} aria-hidden="true" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters((current) => !current)}
              className={`icon-button ${showFilters ? "active" : ""}`}
              type="button"
              title="Filter Lanjutan"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("grid")}
              className={`icon-button ${viewMode === "grid" ? "active" : ""}`}
              type="button"
              title="Grid view"
            >
              <Grid2X2 className="h-4 w-4" aria-hidden="true" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("list")}
              className={`icon-button ${viewMode === "list" ? "active" : ""}`}
              type="button"
              title="List view"
            >
              <LayoutList className="h-4 w-4" aria-hidden="true" />
            </motion.button>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-[rgba(83,88,98,0.12)] pt-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]">
                    Model AI Target:
                  </span>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="admin-select bg-[var(--color-arctic-mist)] text-xs font-semibold py-2"
                  >
                    {uniqueModels.map((model) => (
                      <option key={model} value={model}>
                        {model === "All" ? "Semua Model AI" : model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]">
                    Tag Prompt:
                  </span>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="admin-select bg-[var(--color-arctic-mist)] text-xs font-semibold py-2"
                  >
                    {uniqueTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag === "All" ? "Semua Tag" : `#${tag}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Folder Collections Manager */}
      {userId && (
        <div id="collections-section" className="flex flex-wrap items-center gap-4 rounded-[32px] bg-white p-5 shadow-[var(--shadow-lg)]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]">
            <FolderKanban className="h-4 w-4 text-[var(--color-electric-blue)]" />
            Folder Koleksi:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCollectionId("All")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border ${
                selectedCollectionId === "All"
                  ? "bg-[var(--color-midnight-ink)] text-white border-transparent"
                  : "bg-white text-[var(--color-silver-pine)] border-[rgba(83,88,98,0.16)] hover:bg-[var(--color-arctic-mist)]"
              }`}
            >
              Semua Koleksi
            </button>
            {collections.map((c) => (
              <span
                key={c.id}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border ${
                  selectedCollectionId === c.id
                    ? "bg-[var(--color-electric-blue)] text-white border-transparent"
                    : "bg-white text-[var(--color-silver-pine)] border-[rgba(83,88,98,0.16)] hover:bg-[var(--color-arctic-mist)]"
                }`}
              >
                <button type="button" onClick={() => setSelectedCollectionId(c.id)}>
                  📁 {c.name}
                </button>
                <button
                  type="button"
                  onClick={() => deleteCollection(c.id)}
                  className="hover:text-red-500 font-bold ml-1 text-[10px]"
                  title="Hapus Koleksi"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createCollection(newCollectionName);
            }}
            className="flex items-center gap-2 ml-auto"
          >
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Nama Koleksi..."
              className="rounded-xl border border-[rgba(83,88,98,0.18)] px-3 py-1.5 text-xs font-semibold text-[var(--color-obsidian)] outline-none"
              required
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center p-1.5 rounded-xl bg-[var(--color-midnight-ink)] text-white hover:opacity-90"
              title="Tambah Koleksi"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        <motion.button
          layout
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => setActiveCategory("All")}
          className={`category-pill ${activeCategory === "All" ? "active" : ""}`}
        >
          All Prompts
        </motion.button>
        {categories.map((category) => {
          const Icon = iconMap[category.iconName];

          return (
            <motion.button
              layout
              whileTap={{ scale: 0.97 }}
              key={category.slug}
              type="button"
              onClick={() => setActiveCategory(category.name)}
              className={`category-pill ${activeCategory === category.name ? "active" : ""}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {category.name}
            </motion.button>
          );
        })}
      </div>

      {favoritesOnly ? (
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[var(--color-electric-blue)] shadow-[var(--shadow-lg)]">
          <Star className="h-4 w-4" fill="currentColor" aria-hidden="true" />
          Menampilkan prompt favorit
        </div>
      ) : null}

      <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "grid gap-3"}>
        <AnimatePresence mode="popLayout">
          {filteredPrompts.map((prompt) => (
            <motion.article
              layout
              key={prompt.id}
              className={`prompt-card group ${viewMode === "list" ? "compact" : ""}`}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <motion.span
                      className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--color-whisper-fade-yellow)] text-[var(--color-sunburst-yellow)]"
                      whileHover={{ rotate: 8, scale: 1.04 }}
                    >
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                    </motion.span>
                    <div>
                      <h3 className="font-aeonik text-lg leading-tight tracking-[-0.02em] text-[var(--color-obsidian)]">
                        {prompt.title}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-[var(--color-ash-gray)]">
                        {prompt.model}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setShowAddToCollectionId(showAddToCollectionId === prompt.id ? "" : prompt.id)}
                      className={`icon-button ${collectionItems[prompt.id]?.size ? "active" : ""}`}
                      type="button"
                      title="Simpan ke koleksi"
                    >
                      <Folder className="h-4 w-4" aria-hidden="true" />
                    </motion.button>
                    
                    <AnimatePresence>
                      {showAddToCollectionId === prompt.id && (
                        <motion.div
                          className="absolute right-0 top-12 z-20 w-48 rounded-2xl border border-[rgba(83,88,98,0.14)] bg-white p-3 text-left shadow-[var(--shadow-lg)]"
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 3, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                        >
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-ash-gray)]">
                            Simpan ke Koleksi:
                          </p>
                          {collections.length === 0 ? (
                            <p className="text-[11px] font-semibold text-[var(--color-silver-pine)]">
                              Belum ada koleksi. Buat koleksi baru di atas.
                            </p>
                          ) : (
                            <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                              {collections.map((c) => {
                                const isChecked = collectionItems[prompt.id]?.has(c.id);
                                return (
                                  <label
                                    key={c.id}
                                    className="flex items-center gap-2 text-xs font-semibold text-[var(--color-silver-pine)] cursor-pointer hover:text-[var(--color-obsidian)]"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => togglePromptInCollection(prompt.id, c.id)}
                                    />
                                    <span className="truncate">{c.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleFavorite(prompt.id)}
                    className={`icon-button ${favoriteIds.has(prompt.id) ? "active" : ""}`}
                    type="button"
                    title={favoriteIds.has(prompt.id) ? "Remove favorite" : "Favorite"}
                  >
                    <Star
                      className="h-4 w-4"
                      fill={favoriteIds.has(prompt.id) ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                  </motion.button>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--color-mint-glaze)] px-3 py-1 text-xs font-semibold text-[var(--color-silver-pine)]">
                  {prompt.category}
                </span>
                {prompt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--color-sky-wash)] px-3 py-1 text-xs font-semibold text-[var(--color-silver-pine)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p
                className={`text-sm font-medium leading-6 tracking-[-0.01em] text-[var(--color-silver-pine)] whitespace-pre-wrap ${
                  viewMode === "grid" ? "min-h-32" : "line-clamp-3"
                }`}
                dangerouslySetInnerHTML={{ __html: getRenderedBody(prompt.body, prompt.id) }}
              />

              {(() => {
                const placeholders = extractPlaceholders(prompt.body);
                if (placeholders.length === 0) return null;

                return (
                  <div className="mt-4 space-y-3 rounded-2xl bg-[var(--color-sky-wash)]/40 p-4 border border-[rgba(83,88,98,0.08)]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]">
                      Lengkapi Variabel Prompt:
                    </p>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {placeholders.map((placeholder) => (
                        <div key={placeholder} className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-[var(--color-silver-pine)]/80">
                            {placeholder.charAt(0).toUpperCase() + placeholder.slice(1)}
                          </span>
                          <input
                            type="text"
                            value={inputs[prompt.id]?.[placeholder] ?? ""}
                            onChange={(e) => {
                              setInputs((prev) => ({
                                ...prev,
                                [prompt.id]: {
                                  ...(prev[prompt.id] ?? {}),
                                  [placeholder]: e.target.value,
                                },
                              }));
                            }}
                            placeholder={`Isi ${placeholder}...`}
                            className="w-full rounded-xl border border-[rgba(83,88,98,0.14)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-obsidian)] outline-none transition focus:border-[var(--color-electric-blue)]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => copyPrompt(prompt)}
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-midnight-ink)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] transition hover:-translate-y-0.5 ${
                  viewMode === "grid" ? "w-full" : "w-full sm:w-auto"
                }`}
              >
                {copiedTitle === prompt.title ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copiedTitle === prompt.title ? "Copied" : "Copy Prompt"}
              </motion.button>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {filteredPrompts.length === 0 ? (
        <div className="rounded-[32px] bg-white p-8 text-center text-sm font-semibold text-[var(--color-silver-pine)] shadow-[var(--shadow-lg)]">
          Belum ada prompt yang cocok dengan filter ini.
        </div>
      ) : null}
    </section>
  );
}
