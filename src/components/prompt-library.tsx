"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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
  Heart,
  LayoutList,
  MessageSquareText,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  WandSparkles,
  SlidersHorizontal,
  X,
  Zap,
} from "lucide-react";
import type { IconName, PromptCategoryView, PromptView } from "@/lib/prompt-data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

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
  const [selectedPlaygroundPrompt, setSelectedPlaygroundPrompt] = useState<PromptView | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteSelectedIndex, setPaletteSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  // Feedback state
  const [feedback, setFeedback] = useState<"up" | "down" | "none">("none");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch feedback when opening playground
  useEffect(() => {
    if (selectedPlaygroundPrompt && isSupabaseConfigured && supabase) {
      const fetchFeedback = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) return;
         const { data } = await supabase
            .from("prompt_feedback")
            .select("is_positive")
            .eq("prompt_id", selectedPlaygroundPrompt.id)
            .eq("user_id", user.id)
            .single();
         if (data) setFeedback(data.is_positive ? "up" : "down");
         else setFeedback("none");
      };
      setFeedback("none");
      fetchFeedback();
    }
  }, [selectedPlaygroundPrompt]);

  const handleFeedback = async (isPositive: boolean) => {
    if (!isSupabaseConfigured || !supabase || submittingFeedback || !selectedPlaygroundPrompt) return;
    setSubmittingFeedback(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Anda harus login untuk memberi rating.");
      setSubmittingFeedback(false);
      return;
    }

    const { error } = await supabase.from("prompt_feedback").upsert({
      prompt_id: selectedPlaygroundPrompt.id,
      user_id: user.id,
      is_positive: isPositive
    }, { onConflict: 'prompt_id,user_id' });

    if (!error) {
      setFeedback(isPositive ? "up" : "down");
    }
    setSubmittingFeedback(false);
  };

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

  const isMac = typeof window !== "undefined" && navigator.userAgent.toLowerCase().includes("mac");

  // Filtered prompts specifically for the command palette search
  const paletteFilteredPrompts = useMemo(() => {
    if (!paletteQuery.trim()) return prompts.slice(0, 8); // show first 8 items as suggestion
    return prompts.filter((prompt) => {
      const haystack = [prompt.title, prompt.category, prompt.body, prompt.model, ...prompt.tags]
        .join(" ")
        .toLowerCase();
      return haystack.includes(paletteQuery.toLowerCase());
    });
  }, [prompts, paletteQuery]);

  // Reset index when query changes
  useEffect(() => {
    setPaletteSelectedIndex(0);
  }, [paletteQuery]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Toggle palette: Cmd + K or Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key?.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
        setPaletteQuery("");
        return;
      }

      if (!isPaletteOpen) return;

      // Escape to close
      if (e.key === "Escape") {
        e.preventDefault();
        setIsPaletteOpen(false);
        return;
      }

      // Arrow Down
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setPaletteSelectedIndex((prev) =>
          paletteFilteredPrompts.length === 0
            ? 0
            : (prev + 1) % paletteFilteredPrompts.length
        );
        return;
      }

      // Arrow Up
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setPaletteSelectedIndex((prev) =>
          paletteFilteredPrompts.length === 0
            ? 0
            : (prev - 1 + paletteFilteredPrompts.length) % paletteFilteredPrompts.length
        );
        return;
      }

      // Enter key
      if (e.key === "Enter") {
        e.preventDefault();
        const activePrompt = paletteFilteredPrompts[paletteSelectedIndex];
        if (activePrompt) {
          setSelectedPlaygroundPrompt(activePrompt);
          setIsPaletteOpen(false);
        }
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPaletteOpen, paletteFilteredPrompts, paletteSelectedIndex]);

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
        className="flex flex-col gap-4 rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-4 shadow-[var(--shadow-lg)] dark:bg-[var(--color-canvas-white)]"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center justify-between gap-3 rounded-full border border-[rgba(83,88,98,0.16)] bg-[var(--color-arctic-mist)] px-4 py-3">
            <div className="flex flex-1 items-center gap-3">
              <Search className="h-4 w-4 text-[var(--color-silver-pine)]" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari prompt, tag, kategori, atau model AI..."
                className="w-full bg-transparent text-sm font-medium tracking-[-0.01em] text-[var(--color-obsidian)] outline-none placeholder:text-[var(--color-ash-gray)]"
              />
            </div>
            <span className="hidden md:inline-flex items-center gap-1 rounded-md border border-[rgba(83,88,98,0.15)] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 px-2 py-1 text-[10px] font-bold text-[var(--color-ash-gray)] shadow-sm pointer-events-none">
              {isMac ? "⌘K" : "Ctrl+K"}
            </span>
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

      {/* Folder Collections Manager moved to its own tab */}

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
        <div className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 px-4 py-2 text-xs font-semibold text-[var(--color-electric-blue)] shadow-[var(--shadow-lg)] dark:bg-[var(--color-canvas-white)]">
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
              className={`prompt-card group cursor-pointer ${viewMode === "list" ? "compact" : ""}`}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedPlaygroundPrompt(prompt)}
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
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddToCollectionId(showAddToCollectionId === prompt.id ? "" : prompt.id);
                      }}
                      className={`icon-button ${collectionItems[prompt.id]?.size ? "active" : ""}`}
                      type="button"
                      title="Simpan ke koleksi"
                    >
                      <Folder className="h-4 w-4" aria-hidden="true" />
                    </motion.button>
                    
                    <AnimatePresence>
                      {showAddToCollectionId === prompt.id && (
                        <motion.div
                          className="absolute right-0 top-12 z-20 w-48 rounded-2xl border border-[rgba(83,88,98,0.14)] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-3 text-left shadow-[var(--shadow-lg)] dark:bg-[var(--color-canvas-white)] dark:border-white/10"
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
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        togglePromptInCollection(prompt.id, c.id);
                                      }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(prompt.id);
                    }}
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
                className={`text-sm font-medium leading-6 tracking-[-0.01em] text-[var(--color-silver-pine)] line-clamp-4 ${
                  viewMode === "grid" ? "min-h-[6.5rem]" : ""
                }`}
                dangerouslySetInnerHTML={{ __html: getRenderedBody(prompt.body, prompt.id) }}
              />

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlaygroundPrompt(prompt);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-midnight-ink)] px-4 py-2.5 text-xs sm:text-sm font-bold text-white dark:text-[var(--color-sky-wash)] shadow-[var(--shadow-subtle)] transition hover:opacity-90 active:scale-95"
                >
                  <Sparkles className="h-4 w-4 text-[var(--color-sunburst-yellow)]" aria-hidden="true" />
                  Playground
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyPrompt(prompt);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(83,88,98,0.16)] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-[var(--color-obsidian)] transition hover:bg-[var(--color-arctic-mist)] active:scale-95 dark:bg-[var(--color-canvas-white)] dark:border-white/10 dark:hover:bg-white/5"
                  title="Copy Quick"
                >
                  {copiedTitle === prompt.title ? (
                    <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedTitle === prompt.title ? "Copied" : "Copy"}
                </button>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {filteredPrompts.length === 0 ? (
        <div className="rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-8 text-center text-sm font-semibold text-[var(--color-silver-pine)] shadow-[var(--shadow-lg)] dark:bg-[var(--color-canvas-white)]">
          Belum ada prompt yang cocok dengan filter ini.
        </div>
      ) : null}

      {/* Playground Drawer Panel */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedPlaygroundPrompt && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlaygroundPrompt(null)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-0 right-0 top-0 z-50 flex h-full w-full flex-col bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 shadow-2xl md:max-w-2xl border-l border-[rgba(83,88,98,0.12)] dark:bg-[var(--color-canvas-white)] dark:border-white/10"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[rgba(83,88,98,0.12)] p-6">
                <div>
                  <span className="rounded-full bg-[var(--color-mint-glaze)] px-3 py-1 text-xs font-semibold text-[var(--color-silver-pine)]">
                    {selectedPlaygroundPrompt.category}
                  </span>
                  <h3 className="mt-2 font-aeonik text-xl font-bold tracking-[-0.02em] text-[var(--color-obsidian)]">
                    {selectedPlaygroundPrompt.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-[var(--color-ash-gray)]">
                    AI Target: {selectedPlaygroundPrompt.model}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFeedback(true)}
                    disabled={submittingFeedback}
                    className={`rounded-full p-2.5 transition-colors ${
                      feedback === "up" 
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-[var(--color-sky-wash)] text-[var(--color-silver-pine)] hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20"
                    }`}
                    title="Prompt ini bagus"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback(false)}
                    disabled={submittingFeedback}
                    className={`rounded-full p-2.5 transition-colors ${
                      feedback === "down" 
                        ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" 
                        : "bg-[var(--color-sky-wash)] text-[var(--color-silver-pine)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    }`}
                    title="Prompt ini butuh perbaikan"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                  <div className="w-px h-6 bg-[rgba(83,88,98,0.12)] mx-1" />
                  <button
                    type="button"
                    onClick={() => setSelectedPlaygroundPrompt(null)}
                    className="rounded-full bg-[var(--color-sky-wash)] p-2 text-[var(--color-silver-pine)] hover:bg-[var(--color-midnight-ink)] hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {/* Variable inputs section */}
                {(() => {
                  const placeholders = extractPlaceholders(selectedPlaygroundPrompt.body);
                  if (placeholders.length === 0) return null;

                  return (
                    <div className="space-y-4 rounded-3xl bg-[var(--color-sky-wash)]/50 p-5 border border-[rgba(83,88,98,0.12)]">
                      <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)]">
                        Lengkapi Variabel Prompt:
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {placeholders.map((placeholder) => (
                          <div key={placeholder} className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-[var(--color-silver-pine)]/85">
                              {placeholder.charAt(0).toUpperCase() + placeholder.slice(1)}
                            </span>
                            <input
                              type="text"
                              value={inputs[selectedPlaygroundPrompt.id]?.[placeholder] ?? ""}
                              onChange={(e) => {
                                setInputs((prev) => ({
                                  ...prev,
                                  [selectedPlaygroundPrompt.id]: {
                                    ...(prev[selectedPlaygroundPrompt.id] ?? {}),
                                    [placeholder]: e.target.value,
                                  },
                                }));
                              }}
                              placeholder={`Isi nilai untuk ${placeholder}...`}
                              className="w-full rounded-2xl border border-[rgba(83,88,98,0.16)] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 px-4 py-2.5 text-sm font-semibold text-[var(--color-obsidian)] outline-none transition focus:border-[var(--color-electric-blue)] focus:ring-1 focus:ring-[var(--color-electric-blue)] dark:bg-[var(--color-canvas-white)] dark:border-white/20"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Prompt Preview section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-silver-pine)] flex items-center justify-between">
                    Live Compiled Preview:
                    {extractPlaceholders(selectedPlaygroundPrompt.body).length > 0 && (
                      <span className="text-[10px] font-semibold text-[var(--color-electric-blue)] normal-case">
                        *Terupdate otomatis saat mengetik
                      </span>
                    )}
                  </h4>
                  <div className="rounded-3xl border border-[rgba(83,88,98,0.14)] bg-[var(--color-arctic-mist)] p-6 shadow-inner">
                    <p
                      className="text-sm font-medium leading-relaxed tracking-[-0.01em] text-[var(--color-obsidian)] whitespace-pre-wrap selection:bg-[var(--color-whisper-fade-blue)]"
                      dangerouslySetInnerHTML={{
                        __html: getRenderedBody(selectedPlaygroundPrompt.body, selectedPlaygroundPrompt.id),
                      }}
                    />
                  </div>
                </div>

                {/* Info and Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedPlaygroundPrompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[var(--color-sky-wash)] px-3 py-1 text-xs font-semibold text-[var(--color-silver-pine)] border border-[rgba(83,88,98,0.06)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-[rgba(83,88,98,0.12)] p-6 bg-[var(--color-arctic-mist)]/50 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => copyPrompt(selectedPlaygroundPrompt)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-midnight-ink)] px-6 py-4 text-base font-bold text-white dark:text-[var(--color-sky-wash)] shadow-lg transition hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {copiedTitle === selectedPlaygroundPrompt.title ? (
                    <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
                  ) : (
                    <Copy className="h-5 w-5" aria-hidden="true" />
                  )}
                  {copiedTitle === selectedPlaygroundPrompt.title ? "Compiled Prompt Copied!" : "Copy Compiled Prompt"}
                </button>
                
                {/* External AI shortcuts */}
                <div className="flex gap-2">
                  <a
                    href="https://chat.openai.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(83,88,98,0.16)] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 px-5 py-4 text-sm font-bold text-[var(--color-obsidian)] transition hover:bg-[var(--color-arctic-mist)] dark:bg-[var(--color-canvas-white)] dark:border-white/10 dark:hover:bg-white/5"
                  >
                    ChatGPT
                  </a>
                  <a
                    href="https://claude.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(83,88,98,0.16)] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 px-5 py-4 text-sm font-bold text-[var(--color-obsidian)] dark:text-white transition hover:bg-[var(--color-arctic-mist)] dark:hover:bg-white/5"
                  >
                    Claude
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    )}

      {/* Command Palette Search Overlay */}
      {mounted && createPortal(
        <AnimatePresence>
          {isPaletteOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPaletteOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Dialog Container */}
            <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 md:pt-32 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/20 bg-white/95 p-3 shadow-2xl backdrop-blur-xl pointer-events-auto dark:bg-[var(--color-canvas-white)]/95 dark:border-white/10"
              >
                {/* Search Bar Input */}
                <div className="flex items-center gap-3 border-b border-[rgba(83,88,98,0.12)] px-4 py-3">
                  <Search className="h-5 w-5 text-[var(--color-silver-pine)]" />
                  <input
                    autoFocus
                    value={paletteQuery}
                    onChange={(e) => setPaletteQuery(e.target.value)}
                    placeholder="Ketik kata kunci untuk mencari prompt..."
                    className="w-full bg-transparent text-sm font-semibold tracking-[-0.01em] text-[var(--color-obsidian)] outline-none placeholder:text-[var(--color-ash-gray)]"
                  />
                  <span className="rounded-lg bg-[var(--color-sky-wash)] px-2 py-1 text-[10px] font-bold text-[var(--color-electric-blue)]">
                    ESC
                  </span>
                </div>

                {/* Results List */}
                <div className="mt-2 max-h-72 overflow-y-auto no-scrollbar space-y-1">
                  {paletteFilteredPrompts.length === 0 ? (
                    <div className="p-8 text-center text-xs font-semibold text-[var(--color-silver-pine)]">
                      Tidak ada prompt yang cocok dengan pencarian Anda.
                    </div>
                  ) : (
                    paletteFilteredPrompts.map((prompt, index) => {
                      const isSelected = index === paletteSelectedIndex;
                      return (
                        <button
                          key={prompt.id}
                          onClick={() => {
                            setSelectedPlaygroundPrompt(prompt);
                            setIsPaletteOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all ${
                            isSelected
                              ? "bg-[var(--color-midnight-ink)] text-white dark:text-[var(--color-sky-wash)] shadow-md"
                              : "hover:bg-[var(--color-arctic-mist)] text-[var(--color-obsidian)]"
                          }`}
                        >
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold truncate">
                              {prompt.title}
                            </h4>
                            <p className={`mt-0.5 text-[11px] font-semibold truncate ${
                              isSelected ? "text-white/80 dark:text-[var(--color-sky-wash)]/80" : "text-[var(--color-silver-pine)]"
                            }`}>
                              AI Target: {prompt.model}
                            </p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold shrink-0 ml-3 ${
                            isSelected
                              ? "bg-white/20 text-white dark:bg-black/10 dark:text-[var(--color-sky-wash)]"
                              : "bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)]"
                          }`}>
                            {prompt.category}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer Instructions */}
                <div className="flex items-center justify-between border-t border-[rgba(83,88,98,0.12)] mt-3 px-4 pt-3 text-[10px] font-bold text-[var(--color-ash-gray)] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>↑↓ Navigasi</span>
                    <span className="mx-1">•</span>
                    <span>↵ Buka Playground</span>
                  </div>
                  <span>{paletteFilteredPrompts.length} hasil</span>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>,
      document.body
    )}
    </section>
  );
}
