import type { Metadata } from "next";
import { Geist, Montserrat } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { PhantomUIProvider } from "@/components/phantom-ui-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const aeonikFallback = Montserrat({
  variable: "--font-aeonik",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "PromptVault OS - Multi-AI Prompt Manager Premium #1 Indonesia",
    template: "%s | PromptVault OS",
  },
  description:
    "Platform prompt manager premium #1 di Indonesia untuk GPT, Claude, Gemini, image AI, video AI, dan agent workflow. Simpan, kelola, dan temukan prompt terbaik Anda.",
  keywords: [
    "prompt manager",
    "AI prompt",
    "GPT prompt",
    "Claude prompt",
    "Gemini prompt",
    "prompt Indonesia",
    "AI workflow",
    "prompt template",
  ],
  authors: [{ name: "PromptVault OS" }],
  creator: "PromptVault OS",
  metadataBase: new URL("https://www.promptvault.codes"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "PromptVault OS",
    title: "PromptVault OS - Multi-AI Prompt Manager Premium #1 Indonesia",
    description:
      "Platform prompt manager premium untuk GPT, Claude, Gemini, dan semua AI. Simpan, kelola, dan temukan prompt terbaik Anda dalam 1 detik.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptVault OS - Multi-AI Prompt Manager",
    description:
      "Platform prompt manager premium #1 di Indonesia untuk semua AI workflow.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${aeonikFallback.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2717693315276182"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full overflow-x-hidden">
        <PhantomUIProvider />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
