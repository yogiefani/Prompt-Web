import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSiteSettingsData } from "@/lib/prompt-data";

export default async function TutorialsLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettingsData();

  return (
    <div className="min-h-screen bg-[var(--color-sky-wash)] text-[var(--color-obsidian)] selection:bg-[var(--color-electric-blue)] selection:text-white">
      <header className="sticky top-0 z-40 border-b border-[rgba(83,88,98,0.1)] bg-[rgba(235,245,255,0.82)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(9,13,20,0.88)]">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <BrandMark />
          <div className="hidden items-center gap-8 text-sm font-bold text-[var(--color-silver-pine)] md:flex">
            <Link href="/#features" className="hover:text-[var(--color-electric-blue)] transition-colors">Fitur</Link>
            <Link href="/#faq" className="hover:text-[var(--color-electric-blue)] transition-colors">FAQ</Link>
            <Link href="/tutorials" className="hover:text-[var(--color-electric-blue)] transition-colors text-[var(--color-electric-blue)]">Tutorials</Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="secondary-button hidden sm:inline-flex">
              Login
            </Link>
            <a href={settings.productUrl} className="primary-button">
              Beli Access
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="border-t border-[rgba(83,88,98,0.1)] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 py-8 text-center text-sm font-medium text-[var(--color-silver-pine)]">
        &copy; {new Date().getFullYear()} {settings.brandName}. All rights reserved.
      </footer>
    </div>
  );
}
