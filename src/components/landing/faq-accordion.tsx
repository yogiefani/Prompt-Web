"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Apakah aplikasi ini berbayar langganan (subscription)?",
    answer: "Tidak! Anda hanya perlu membeli lisensi satu kali (One-Time Payment) dan Anda bisa menikmati semua fitur ini selamanya tanpa biaya bulanan."
  },
  {
    question: "Apakah saya bisa menjual akses ke member saya?",
    answer: "Tentu saja! Sistem ini dirancang dengan Role 'Superadmin' dan 'Member'. Anda bebas memonetisasi akses ke Prompt Library Anda sendiri."
  },
  {
    question: "Berapa kapasitas penyimpanan prompt-nya?",
    answer: "PromptVault OS menggunakan database Supabase yang sangat ringan untuk teks. Kapasitasnya hampir tidak terbatas untuk penggunaan wajar (ribuan prompt)."
  },
  {
    question: "Apakah ada panduan instalasinya?",
    answer: "Ya, kami menyediakan panduan instalasi lengkap step-by-step dan dokumentasi cara mengatur database dan variabel environment."
  },
  {
    question: "Bisakah saya mengedit kode sumbernya?",
    answer: "Bisa. Anda mendapatkan akses penuh ke source code (Next.js & Tailwind CSS) sehingga bebas dimodifikasi sesuai branding dan kebutuhan Anda."
  }
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white py-24 sm:py-32" id="faq">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-aeonik text-3xl font-bold tracking-[-0.02em] text-[var(--color-obsidian)] sm:text-4xl">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-4 text-lg font-medium text-[var(--color-silver-pine)]">
            Semua yang perlu Anda ketahui tentang PromptVault OS.
          </p>
        </div>
        <div className="mt-16 flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`rounded-2xl border transition-colors ${openIndex === index ? "border-[var(--color-electric-blue)] bg-[var(--color-sky-wash)]" : "border-[rgba(83,88,98,0.15)] bg-white hover:bg-[var(--color-arctic-mist)]"}`}
            >
              <button 
                className="flex w-full items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-aeonik text-lg font-bold text-[var(--color-obsidian)]">{faq.question}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-[var(--color-silver-pine)] transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`} />
              </button>
              <div 
                className={`grid transition-all duration-300 ease-in-out ${openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 text-base font-medium leading-relaxed text-[var(--color-silver-pine)]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
