"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingHeader({ productUrl }: { productUrl: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-[rgba(235,245,255,0.82)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(9,13,20,0.88)]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <BrandMark />
        </Link>
        
        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-8 text-sm font-bold text-[var(--color-silver-pine)] md:flex">
          <a href="#features" className="hover:text-[var(--color-electric-blue)] transition-colors">Fitur</a>
          <a href="#faq" className="hover:text-[var(--color-electric-blue)] transition-colors">FAQ</a>
          <Link href="/tutorials" className="hover:text-[var(--color-electric-blue)] transition-colors">Tutorials</Link>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href="/login" className="secondary-button">
            Login
          </Link>
          <a href={productUrl} className="primary-button">
            Beli Access
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        {/* Mobile Header Toggle Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle className="icon-button h-9 w-9" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="icon-button h-9 w-9 flex items-center justify-center p-0"
            type="button"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="space-y-3 border-t border-white/50 bg-[rgba(235,245,255,0.95)] px-4 py-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(9,13,20,0.96)] md:hidden">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-bold text-[var(--color-silver-pine)] hover:bg-[var(--color-sky-wash)] hover:text-[var(--color-electric-blue)] transition-all"
          >
            Fitur
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-bold text-[var(--color-silver-pine)] hover:bg-[var(--color-sky-wash)] hover:text-[var(--color-electric-blue)] transition-all"
          >
            FAQ
          </a>
          <Link
            href="/tutorials"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-bold text-[var(--color-silver-pine)] hover:bg-[var(--color-sky-wash)] hover:text-[var(--color-electric-blue)] transition-all"
          >
            Tutorials
          </Link>
          <div className="border-t border-[rgba(83,88,98,0.1)] pt-3 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="secondary-button w-full justify-center py-3 text-sm font-bold"
            >
              Login
            </Link>
            <a
              href={productUrl}
              onClick={() => setMobileMenuOpen(false)}
              className="primary-button w-full justify-center py-3 text-sm font-bold"
            >
              Beli Access
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
