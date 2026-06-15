"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, Image as ImageIcon, EyeOff, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ImageCropper } from "@/components/image-cropper";

type GalleryItem = {
  id: string;
  image_url: string;
  row_index: 1 | 2;
  sort_order: number;
  is_active: boolean;
};

export function GalleryCmsManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRowTab, setActiveRowTab] = useState<1 | 2>(1);

  // Cropper State
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("landing_gallery")
      .select("*")
      .order("sort_order", { ascending: true });
      
    if (error) {
      console.error(error);
      alert("Gagal memuat galeri.");
    } else {
      setItems(data as GalleryItem[]);
    }
    setLoading(false);
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCropImageSrc(reader.result?.toString() || "");
      });
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = ""; // Reset input
    }
  };

  const handleCropComplete = async (croppedBase64: string) => {
    setCropImageSrc(null); // Close modal
    if (!supabase) return;
    
    // Upload to DB
    const newItem = {
      image_url: croppedBase64,
      row_index: activeRowTab,
      sort_order: items.filter(i => i.row_index === activeRowTab).length,
      is_active: true,
    };

    const { data, error } = await supabase
      .from("landing_gallery")
      .insert(newItem)
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Gagal menyimpan foto: " + error.message);
    } else {
      setItems([...items, data as GalleryItem]);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("landing_gallery")
      .update({ is_active: !current })
      .eq("id", id);
    if (!error) {
      setItems(items.map(i => i.id === id ? { ...i, is_active: !current } : i));
    }
  };

  const deleteItem = async (id: string) => {
    if (!supabase) return;
    if (!confirm("Yakin ingin menghapus foto ini?")) return;
    const { error } = await supabase.from("landing_gallery").delete().eq("id", id);
    if (!error) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const filteredItems = items.filter(i => i.row_index === activeRowTab);

  // Removed early return for loading
  return (
    <div className="space-y-8">
      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImageSrc(null)}
          aspectRatio={4 / 5} // Portrait ratio matching cards
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-aeonik text-3xl font-bold text-[var(--color-obsidian)]">
            Galeri Landing Page
          </h1>
          <p className="text-sm text-[var(--color-silver-pine)] mt-2">
            Atur foto-foto yang berputar (Carousel) di halaman utama. Gunakan foto berkualitas tinggi.
          </p>
        </div>
        
        <div>
          <input
            type="file"
            id="gallery-upload"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <label htmlFor="gallery-upload" className="primary-button flex items-center gap-2 cursor-pointer">
            <Plus className="h-5 w-5" />
            Tambah Foto Baru
          </label>
        </div>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 border border-[rgba(83,88,98,0.1)] shadow-[var(--shadow-md)] overflow-hidden">
        <div className="flex border-b border-[rgba(83,88,98,0.08)] bg-[var(--color-arctic-mist)]">
          <button
            onClick={() => setActiveRowTab(1)}
            className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${
              activeRowTab === 1
                ? "text-[var(--color-electric-blue)] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 border-b-2 border-[var(--color-electric-blue)]"
                : "text-[var(--color-silver-pine)] hover:text-[var(--color-obsidian)] hover:bg-white/50"
            }`}
          >
            Baris 1 (Gerak ke Kiri)
          </button>
          <button
            onClick={() => setActiveRowTab(2)}
            className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${
              activeRowTab === 2
                ? "text-[var(--color-electric-blue)] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 border-b-2 border-[var(--color-electric-blue)]"
                : "text-[var(--color-silver-pine)] hover:text-[var(--color-obsidian)] hover:bg-white/50"
            }`}
          >
            Baris 2 (Gerak ke Kanan)
          </button>
        </div>

        <div className="p-6">
          <phantom-ui loading={loading ? "true" : undefined}>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {Array(10).fill(0).map((_, i) => (
                  <div key={`skeleton-${i}`} className="aspect-[4/5] rounded-2xl bg-[var(--color-arctic-mist)]" />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 text-[var(--color-silver-pine)]">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Belum ada foto di baris ini.</p>
                <p className="text-xs mt-1">Klik tombol "Tambah Foto Baru" di atas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="group relative rounded-2xl border border-[rgba(83,88,98,0.1)] overflow-hidden bg-[var(--color-arctic-mist)]">
                    <div className="aspect-[4/5] relative">
                      <img
                        src={item.image_url}
                        alt="Gallery Item"
                        className={`w-full h-full object-cover transition-all ${
                          !item.is_active ? "grayscale opacity-50" : ""
                        }`}
                      />
                      
                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                        <button
                          onClick={() => toggleActive(item.id, item.is_active)}
                          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 rounded-xl text-sm font-bold text-[var(--color-obsidian)] hover:bg-[var(--color-electric-blue)] hover:text-white transition-colors"
                        >
                          {item.is_active ? (
                            <><EyeOff className="h-4 w-4" /> Sembunyikan</>
                          ) : (
                            <><Eye className="h-4 w-4" /> Tampilkan</>
                          )}
                        </button>
                        
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 rounded-xl text-sm font-bold text-white hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" /> Hapus
                        </button>
                      </div>
                    </div>
                    
                    {/* Status Indicator */}
                    {!item.is_active && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                        Tersembunyi
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </phantom-ui>
        </div>
      </div>
    </div>
  );
}
