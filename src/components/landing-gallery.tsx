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

  if (loading) {
    return <div className="py-20 text-center opacity-50">Memuat galeri...</div>;
  }

  // If both rows are empty, return nothing
  if (row1.length === 0 && row2.length === 0) {
    return null;
  }

  // Helper to render a marquee row
  // We duplicate the items 3 times to ensure a seamless infinite scroll loop, 
  // depending on how many items there are.
  const renderRow = (items: GalleryItem[], direction: "left" | "right") => {
    if (items.length === 0) return null;
    
    // Duplicate items to create infinite scroll effect
    const multipliedItems = [...items, ...items, ...items, ...items];

    return (
      <div className="relative w-full overflow-hidden flex py-4 marquee-container">
        <div 
          className={`flex gap-6 min-w-max ${
            direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
          }`}
        >
          {multipliedItems.map((item, i) => (
            <div 
              key={`${item.id}-${i}`} 
              className="relative w-[280px] md:w-[320px] aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[var(--shadow-lg)] border border-[rgba(83,88,98,0.08)] transform transition-transform duration-500 hover:scale-[1.03] hover:z-10 bg-[var(--color-arctic-mist)] shrink-0"
            >
              <img 
                src={item.image_url} 
                alt={`Gallery ${i}`} 
                className="w-full h-full object-cover" 
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="py-20 overflow-hidden bg-white">
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
  );
}
