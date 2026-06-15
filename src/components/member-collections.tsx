"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderKanban, Plus, Trash2, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FadeIn, LiftCard, Stagger } from "@/components/motion-primitives";
import type { PromptView } from "@/lib/prompt-data";

type MemberCollectionsProps = {
  prompts: PromptView[];
  source: string;
};

export function MemberCollections({ prompts, source }: MemberCollectionsProps) {
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [collectionItems, setCollectionItems] = useState<Record<string, Set<string>>>({});
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (source !== "supabase" || !supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!isMounted || !user) return;
      setUserId(user.id);

      const { data: cols } = await supabase
        .from("prompt_collections")
        .select("id, name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
        
      if (isMounted && cols) {
        setCollections(cols);
        if (cols.length > 0) {
          const { data: items } = await supabase
            .from("prompt_collection_items")
            .select("collection_id, prompt_id")
            .in("collection_id", cols.map((c) => c.id));
            
          if (isMounted && items) {
            const mapping: Record<string, Set<string>> = {};
            items.forEach((item) => {
              if (!mapping[item.collection_id]) mapping[item.collection_id] = new Set();
              mapping[item.collection_id].add(item.prompt_id);
            });
            setCollectionItems(mapping);
            if (!selectedCollectionId) setSelectedCollectionId(cols[0].id);
          }
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [source, selectedCollectionId]);

  async function createCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !supabase || !newCollectionName.trim()) return;
    
    const { data, error } = await supabase
      .from("prompt_collections")
      .insert({ user_id: userId, name: newCollectionName.trim() })
      .select("id, name")
      .single();
      
    if (error || !data) return;
    
    setCollections((prev) => [...prev, data]);
    setNewCollectionName("");
    if (!selectedCollectionId) setSelectedCollectionId(data.id);
  }

  async function deleteCollection(id: string) {
    if (!supabase) return;
    if (!window.confirm("Hapus folder koleksi ini secara permanen?")) return;
    
    await supabase.from("prompt_collections").delete().eq("id", id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
    if (selectedCollectionId === id) setSelectedCollectionId(null);
  }

  async function removeFromCollection(promptId: string) {
    if (!supabase || !selectedCollectionId) return;
    
    await supabase
      .from("prompt_collection_items")
      .delete()
      .eq("collection_id", selectedCollectionId)
      .eq("prompt_id", promptId);
      
    setCollectionItems((prev) => {
      const next = { ...prev };
      if (next[selectedCollectionId]) {
         next[selectedCollectionId].delete(promptId);
      }
      return next;
    });
  }

  const selectedPrompts = useMemo(() => {
    if (!selectedCollectionId) return [];
    const itemIds = collectionItems[selectedCollectionId];
    if (!itemIds) return [];
    return prompts.filter(p => itemIds.has(p.id));
  }, [selectedCollectionId, collectionItems, prompts]);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Sidebar for Collections */}
      <FadeIn className="flex flex-col gap-4">
        <div className="rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-5 shadow-[var(--shadow-lg)] h-full min-h-[500px]">
          <h3 className="mb-6 flex items-center gap-2 font-aeonik text-lg text-[var(--color-obsidian)]">
            <FolderKanban className="h-5 w-5 text-[var(--color-electric-blue)]" />
            Folder Koleksi
          </h3>
          <form onSubmit={createCollection} className="mb-6 flex items-center gap-2">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Nama folder baru..."
              className="w-full rounded-xl border border-[rgba(83,88,98,0.18)] bg-[var(--color-arctic-mist)] px-3 py-2.5 text-xs font-semibold text-[var(--color-obsidian)] outline-none focus:border-[var(--color-electric-blue)] dark:bg-[var(--color-canvas-white)] dark:border-white/10"
              required
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[var(--color-midnight-ink)] p-2.5 text-white dark:text-[var(--color-sky-wash)] hover:opacity-90 transition-opacity"
              title="Tambah Koleksi"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>

          <div className="flex flex-col gap-1.5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-ash-gray)]">
              Daftar Folder:
            </p>
            {collections.length === 0 ? (
              <p className="text-center text-xs font-medium text-[var(--color-silver-pine)] py-4">Belum ada folder.</p>
            ) : (
              collections.map((c) => (
                <div
                  key={c.id}
                  className={`group flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    selectedCollectionId === c.id
                      ? "bg-[var(--color-electric-blue)] text-white shadow-sm"
                      : "bg-transparent text-[var(--color-silver-pine)] hover:bg-[var(--color-arctic-mist)] hover:text-[var(--color-obsidian)] dark:hover:bg-white/5"
                  }`}
                  onClick={() => setSelectedCollectionId(c.id)}
                >
                  <span className="truncate">📁 {c.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCollection(c.id);
                    }}
                    className={`ml-2 opacity-0 transition-opacity group-hover:opacity-100 ${
                      selectedCollectionId === c.id ? "text-white/80 hover:text-white" : "text-red-400 hover:text-red-600"
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </FadeIn>

      {/* Prompts Area */}
      <FadeIn className="flex flex-col gap-6">
        {!selectedCollectionId ? (
          <div className="flex h-[500px] flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[rgba(83,88,98,0.1)] bg-white/50 dark:bg-[var(--color-canvas-white)]/50">
            <FolderKanban className="mb-4 h-12 w-12 text-[var(--color-ash-gray)] opacity-50" />
            <h3 className="font-aeonik text-xl text-[var(--color-obsidian)]">Pilih atau Buat Koleksi</h3>
            <p className="mt-2 text-sm text-[var(--color-silver-pine)]">Pilih folder di sebelah kiri untuk melihat daftar prompt yang tersimpan.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-subtle)]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-ash-gray)]">Folder Aktif</span>
                <h2 className="mt-1 font-aeonik text-3xl tracking-[-0.02em] text-[var(--color-obsidian)]">
                  {collections.find((c) => c.id === selectedCollectionId)?.name}
                </h2>
              </div>
              <span className="rounded-full bg-[var(--color-sky-wash)] px-4 py-2 text-sm font-semibold text-[var(--color-electric-blue)]">
                {selectedPrompts.length} Prompt Tersimpan
              </span>
            </div>

            {selectedPrompts.length === 0 ? (
              <div className="flex h-[350px] flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[rgba(83,88,98,0.1)] bg-white/50 dark:bg-[var(--color-canvas-white)]/50">
                <Search className="mb-4 h-10 w-10 text-[var(--color-ash-gray)] opacity-50" />
                <h3 className="font-aeonik text-lg text-[var(--color-obsidian)]">Folder ini masih kosong</h3>
                <p className="mt-2 text-sm text-[var(--color-silver-pine)]">Cari prompt di menu Library lalu klik ikon Folder untuk menyimpannya ke sini.</p>
              </div>
            ) : (
              <Stagger className="grid gap-4 md:grid-cols-2">
                {selectedPrompts.map((prompt) => (
                  <LiftCard key={prompt.id} className="group relative flex flex-col justify-between rounded-[28px] bg-white dark:bg-[var(--color-canvas-white)] p-6 shadow-[var(--shadow-lg)] border border-[rgba(83,88,98,0.1)] dark:border-white/10">
                    <div>
                      <h3 className="font-aeonik text-xl leading-tight tracking-[-0.02em] text-[var(--color-obsidian)] pr-8">{prompt.title}</h3>
                      <p className="mt-3 text-sm font-medium leading-relaxed text-[var(--color-silver-pine)] line-clamp-4">{prompt.body}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-[rgba(83,88,98,0.1)] dark:border-white/10">
                      <span className="rounded-full bg-[var(--color-mint-glaze)] px-3 py-1.5 text-xs font-bold text-[var(--color-silver-pine)]">
                        {prompt.category}
                      </span>
                      <button
                        onClick={() => removeFromCollection(prompt.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                      >
                        Keluarkan dari Folder
                      </button>
                    </div>
                  </LiftCard>
                ))}
              </Stagger>
            )}
          </>
        )}
      </FadeIn>
    </div>
  );
}
