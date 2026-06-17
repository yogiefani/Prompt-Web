"use client";

import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { markTutorialAsSeen } from "@/app/actions/tutorial";

export function OnboardingTour({ hasSeenTutorial }: { hasSeenTutorial: boolean }) {
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Hanya jalankan jika user belum pernah melihat tutorial
    // dan tour belum pernah dijalankan di sesi ini (strict mode react call useEffect 2x)
    if (hasSeenTutorial || hasRunRef.current) return;

    hasRunRef.current = true;

    const tourDriver = driver({
      showProgress: true,
      animate: true,
      overlayColor: "rgba(15, 23, 42, 0.75)",
      nextBtnText: "Selanjutnya ➔",
      prevBtnText: "⬅ Sebelumnya",
      doneBtnText: "Selesai",
      steps: [
        {
          popover: {
            title: "Selamat Datang di PromptVault OS! 👋",
            description: "Mari kita mulai tur singkat untuk mengenalkan fitur-fitur utama di dashboard Anda.",
            side: "over",
            align: "center",
          },
        },
        {
          element: "#tour-sidebar",
          popover: {
            title: "Menu Utama",
            description: "Di sini Anda bisa mengakses berbagai fitur seperti Prompt Library, Koleksi Anda, AI Prompt Studio, hingga Tutorial.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#tour-prompt-library",
          popover: {
            title: "Prompt Library",
            description: "Ini adalah perpustakaan utama. Semua prompt tersusun rapi berdasarkan kategori. Anda bisa dengan mudah mencari dan menyalin prompt yang Anda butuhkan.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tour-theme-toggle",
          popover: {
            title: "Ganti Tema",
            description: "Suka tampilan gelap? Anda bisa beralih antara Mode Terang dan Mode Gelap di sini.",
            side: "top",
            align: "start",
          },
        },
      ],
      onDestroyStarted: async () => {
        // Ketika user menekan close (X) atau skip
        if (tourDriver.hasNextStep() || !tourDriver.hasNextStep()) {
          tourDriver.destroy();
          await markTutorialAsSeen();
        }
      },
    });

    // Mulai tour dengan delay sedikit agar DOM render sempurna
    setTimeout(() => {
      tourDriver.drive();
    }, 500);

  }, [hasSeenTutorial]);

  return null;
}
