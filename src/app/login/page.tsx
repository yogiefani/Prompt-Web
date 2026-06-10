import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { FadeIn, ScaleIn } from "@/components/motion-primitives";
import { SupabaseLoginPanel } from "@/components/supabase-login-panel";
import { getSiteSettingsData } from "@/lib/prompt-data";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const settings = await getSiteSettingsData();

  return (
    <main className="min-h-screen bg-[var(--color-sky-wash)] px-4 py-8 text-[var(--color-obsidian)] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/">
          <BrandMark />
        </Link>
        <a href={settings.productUrl} className="secondary-button">
          Beli Access
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <section className="mx-auto grid min-h-[calc(100vh-112px)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <FadeIn>
          <span className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--color-electric-blue)] shadow-[var(--shadow-lg)]">
            <LockKeyhole className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="font-aeonik text-5xl leading-tight tracking-[-0.02em]">
            Login sesuai role akses {settings.brandName}.
          </h1>
          <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-[var(--color-silver-pine)]">
            Form ini memakai Supabase Auth. Superadmin masuk ke console pengelolaan,
            user access masuk ke library prompt premium setelah credential valid.
          </p>
        </FadeIn>

        <ScaleIn className="rounded-[32px] bg-white p-4 shadow-[var(--shadow-lg)]" delay={0.1}>
          <Suspense fallback={<div className="rounded-[28px] bg-[var(--color-arctic-mist)] p-8 text-sm font-semibold text-[var(--color-silver-pine)]">Loading login...</div>}>
            <SupabaseLoginPanel />
          </Suspense>
        </ScaleIn>
      </section>
    </main>
  );
}
