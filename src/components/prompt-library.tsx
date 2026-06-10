"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Check,
  Compass,
  Copy,
  Filter,
  FolderKanban,
  Grid2X2,
  LayoutList,
  MessageSquareText,
  Search,
  Sparkles,
  Star,
  WandSparkles,
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

  useEffect(() => {
    let isMounted = true;

    async function loadFavorites() {
      if (source !== "supabase" || !supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted || !user) return;

      setUserId(user.id);

      const { data, error } = await supabase
        .from("prompt_favorites")
        .select("prompt_id")
        .eq("user_id", user.id);

      if (!isMounted || error) return;

      setFavoriteIds(new Set((data ?? []).map((favorite) => favorite.prompt_id as string)));
    }

    loadFavorites();

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
      const haystack = [prompt.title, prompt.category, prompt.body, prompt.model, ...prompt.tags]
        .join(" ")
        .toLowerCase();

      return matchesCategory && matchesFavorite && haystack.includes(query.toLowerCase());
    });
  }, [activeCategory, favoriteIds, favoritesOnly, prompts, query]);

  async function copyPrompt(prompt: PromptView) {
    await navigator.clipboard.writeText(prompt.body);
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

  return (
    <section className="space-y-6">
      <motion.div
        className="flex flex-col gap-4 rounded-[32px] bg-white p-4 shadow-[var(--shadow-lg)] lg:flex-row lg:items-center lg:justify-between"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
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
            title="Filter favorites"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
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
      </motion.div>

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
                className={`text-sm font-medium leading-6 tracking-[-0.01em] text-[var(--color-silver-pine)] ${
                  viewMode === "grid" ? "min-h-32" : "line-clamp-3"
                }`}
              >
                {prompt.body}
              </p>

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
