"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type GalleryItem = {
  id: string;
  image_url: string;
  row_index: 1 | 2;
  sort_order: number;
  is_active: boolean;
};

export function LandingGallery() {
  const [row1, setRow1] = useState<GalleryItem[]>([]);
  const [row2, setRow2] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("landing_gallery")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setRow1(data.filter((d: GalleryItem) => d.row_index === 1));
        setRow2(data.filter((d: GalleryItem) => d.row_index === 2));
      }
      setLoading(false);
    }
    fetchGallery();
  }, []);

  // If both rows are empty and not loading, return nothing
  if (!loading && row1.length === 0 && row2.length === 0) {
    return null;
  }

  // Helper to render a marquee row
  // We duplicate the items 3 times to ensure a seamless infinite scroll loop, 
  // depending on how many items there are.
  const renderRow = (items: GalleryItem[], direction: "left" | "right") => {
    if (!loading && items.length === 0) return null;
    
    const isSkeleton = loading;
    const skeletonItems = Array(6).fill({ id: 'dummy', image_url: '' } as GalleryItem);
    const displayItems = isSkeleton ? skeletonItems : [...items, ...items, ...items, ...items];

    return (
      <div className="relative w-full overflow-hidden flex py-4 marquee-container">
        <div 
          className={`flex gap-6 min-w-max ${
            isSkeleton ? "" : direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
          }`}
        >
          {displayItems.map((item, i) => (
            <div 
              key={`${item.id}-${i}`} 
              className="relative w-[280px] md:w-[320px] aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[var(--shadow-lg)] border border-[rgba(83,88,98,0.08)] transform transition-transform duration-500 hover:scale-[1.03] hover:z-10 bg-[var(--color-arctic-mist)] shrink-0"
            >
              {item.image_url && (
                <img 
                  src={item.image_url} 
                  alt={`Gallery ${i}`} 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <phantom-ui loading={loading ? "true" : undefined}>
      <section className="py-20 overflow-hidden bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10">
        <div className="container-custom mb-12 text-center max-w-3xl mx-auto">
          <h2 className="font-aeonik text-4xl md:text-5xl font-bold text-[var(--color-obsidian)] leading-tight mb-4">
            Segala Jenis <span className="text-gradient">Produk Brand Dan Jasa</span>
          </h2>
          <p className="text-lg text-[var(--color-silver-pine)]">
            Geser pelan — semua design di bawah ini dibuat tanpa designer, tanpa Canva, tanpa Photoshop.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {renderRow(row1, "left")}
          {renderRow(row2, "right")}
        </div>
      </section>
    </phantom-ui>
  );
}
