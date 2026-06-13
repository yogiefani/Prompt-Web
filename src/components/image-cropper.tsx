"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, Check, ZoomIn, ZoomOut } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

// Helper to create cropped image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  maxWidth = 600
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return "";
  }

  // Calculate target dimensions
  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;

  // Resize if it's too large to save DB space
  if (targetWidth > maxWidth) {
    const ratio = maxWidth / targetWidth;
    targetWidth = maxWidth;
    targetHeight = targetHeight * ratio;
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return canvas.toDataURL("image/jpeg", 0.85); // Compress slightly for DB
}

export function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 4 / 5,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteHandler = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
      alert("Gagal memotong gambar.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-2xl max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(83,88,98,0.08)] bg-[var(--color-arctic-mist)]">
          <div>
            <h3 className="font-aeonik text-lg font-bold text-[var(--color-obsidian)]">
              Sesuaikan Gambar
            </h3>
            <p className="text-sm text-[var(--color-silver-pine)] mt-0.5">
              Geser dan zoom untuk menyesuaikan gambar agar pas dengan bingkai.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="icon-button text-[var(--color-silver-pine)] hover:text-red-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative w-full h-[50vh] min-h-[400px] bg-black/5">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
            showGrid={true}
          />
        </div>

        {/* Controls */}
        <div className="p-6 bg-white flex flex-col gap-6">
          <div className="flex items-center gap-4 px-4">
            <ZoomOut className="h-5 w-5 text-[var(--color-silver-pine)]" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-[var(--color-arctic-mist)] rounded-lg appearance-none cursor-pointer accent-[var(--color-electric-blue)]"
            />
            <ZoomIn className="h-5 w-5 text-[var(--color-silver-pine)]" />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl font-bold text-[var(--color-silver-pine)] bg-[var(--color-arctic-mist)] hover:bg-[rgba(83,88,98,0.1)] transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="primary-button flex items-center gap-2"
            >
              <Check className="h-5 w-5" />
              {isProcessing ? "Memproses..." : "Terapkan & Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
