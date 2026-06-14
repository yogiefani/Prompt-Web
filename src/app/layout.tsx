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
  title: "PromptVault OS - Multi-AI Prompt Manager",
  description:
    "Prompt manager premium untuk GPT, Claude, Gemini, image AI, video AI, dan agent workflow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${aeonikFallback.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full overflow-x-hidden">
        <PhantomUIProvider />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
