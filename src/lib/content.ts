import {
  BarChart3,
  BookOpen,
  Bot,
  Compass,
  FileText,
  FolderKanban,
  MessageSquareText,
  Search,
  Sparkles,
  WandSparkles,
} from "lucide-react";

export const brand = {
  name: "PromptVault OS",
  tagline: "Prompt manager premium untuk semua AI workflow.",
  productUrl: "https://example.com/produk-prompt-manager",
  supportEmail: "support@promptvault.local",
};

export const featurePhases = [
  {
    title: "Tahap 1 - Product Shell",
    description:
      "Landing, login role, library user access, superadmin shell, design system, dan data awal prompt.",
    status: "Ready",
  },
  {
    title: "Tahap 2 - Supabase Auth",
    description:
      "Login Supabase, role superadmin/access, protected route, dan redirect tombol registrasi ke link produk.",
    status: "Ready",
  },
  {
    title: "Tahap 3 - Prompt CMS",
    description:
      "CRUD kategori, prompt, variable, tag, AI model target, status publish, dan bulk import.",
    status: "In progress",
  },
  {
    title: "Tahap 4 - Member Experience",
    description:
      "Search cepat, copy prompt, favorit, collections, prompt versioning, dan rekomendasi workflow.",
    status: "In progress",
  },
  {
    title: "Tahap 5 - Product Ops",
    description:
      "Analytics prompt terpopuler, setting product link, export, audit log, dan integrasi payment/webhook.",
    status: "In progress",
  },
];

export const promptCategories = [
  {
    name: "Content Ideas",
    slug: "content-ideas",
    icon: Sparkles,
    color: "mint",
    description: "Ide konten, angle, seri, dan kalender publikasi.",
  },
  {
    name: "Strategy",
    slug: "strategy",
    icon: Compass,
    color: "blue",
    description: "Positioning, funnel, offer, dan campaign planning.",
  },
  {
    name: "Research",
    slug: "research",
    icon: Search,
    color: "violet",
    description: "Audience insight, competitor scan, dan market mapping.",
  },
  {
    name: "Hooks",
    slug: "hooks",
    icon: WandSparkles,
    color: "yellow",
    description: "Opening line, curiosity gap, dan short-form hook.",
  },
  {
    name: "Captions",
    slug: "captions",
    icon: MessageSquareText,
    color: "orange",
    description: "Caption, hashtag, CTA, dan micro-copy social media.",
  },
  {
    name: "AI Ops",
    slug: "ai-ops",
    icon: Bot,
    color: "blue",
    description: "Prompt untuk GPT, Claude, Gemini, image, video, dan agent.",
  },
];

export const prompts = [
  {
    title: "Audience Pain Finder",
    category: "Content Ideas",
    model: "GPT / Claude",
    tags: ["research", "content"],
    body: "Saya membuat konten untuk [deskripsi audiens]. Berikan 50 masalah yang mungkin dimiliki audiens ini. Sertakan campuran masalah praktis, emosional, finansial, dan sosial.",
  },
  {
    title: "Topic Cluster Builder",
    category: "Content Strategy",
    model: "All text AI",
    tags: ["seo", "planning"],
    body: "Saya membuat konten tentang [topik luas]. Pisahkan topik tersebut menjadi 10 topik kecil, lalu buat 20 ide posting untuk setiap topik dengan sudut pandang berbeda.",
  },
  {
    title: "Hook Rewriter",
    category: "Content Hooks",
    model: "GPT / Gemini",
    tags: ["hook", "short-form"],
    body: "Saya baru menulis postingan ini: [teks]. Buat 15 kalimat pembuka yang lebih kuat, singkat, persuasif, dan menarik perhatian dalam gaya [tone].",
  },
  {
    title: "Instagram Carousel Script",
    category: "Captions",
    model: "All text AI",
    tags: ["instagram", "carousel"],
    body: "Buat script carousel 8 slide tentang [topik]. Slide pertama harus memancing rasa penasaran, slide tengah edukatif, dan slide terakhir berisi CTA yang natural.",
  },
  {
    title: "Offer Clarity Audit",
    category: "Strategy",
    model: "Claude",
    tags: ["offer", "sales"],
    body: "Audit penawaran ini: [deskripsi offer]. Nilai kejelasan target market, problem, promise, proof, mechanism, pricing logic, dan CTA. Beri skor 1-10 dan rekomendasi revisi.",
  },
  {
    title: "Competitor Angle Map",
    category: "Research",
    model: "Gemini / Perplexity",
    tags: ["competitor", "market"],
    body: "Analisis 5 kompetitor di niche [niche]. Temukan angle konten mereka, kelemahan positioning, keyword yang sering muncul, dan peluang konten yang belum banyak disentuh.",
  },
  {
    title: "AI Image Prompt Brief",
    category: "AI Ops",
    model: "Image AI",
    tags: ["image", "creative"],
    body: "Ubah brief visual ini menjadi prompt image AI yang detail: [brief]. Sertakan subject, environment, camera, lighting, composition, texture, color palette, dan negative prompt.",
  },
  {
    title: "Long Form Repurposer",
    category: "Content Strategy",
    model: "GPT / Claude",
    tags: ["repurpose", "workflow"],
    body: "Ubah artikel/video berikut menjadi 12 aset konten: 3 thread, 3 carousel, 3 short video script, dan 3 email. Pertahankan ide utama dan sesuaikan format setiap channel.",
  },
];

export const cheatSheetRows = [
  ["CEO", "Essay", "List"],
  ["Marketer", "Recipe", "PDF"],
  ["Inventor", "Article", "XML"],
  ["Therapist", "Ad Copy", "HTML"],
  ["Journalist", "Headline", "Code"],
  ["Advertiser", "Analysis", "Graphs"],
  ["Copywriter", "Blog Post", "A Table"],
  ["Prompt Engineer", "SEO Keywords", "Markdown"],
  ["Website Designer", "Social Media Post", "Presentation Slides"],
];

export const promptKeywords = [
  "Write",
  "Create",
  "Explain",
  "Summarize",
  "List",
  "Define",
  "Search",
  "Translate",
  "Analyze",
  "Code",
  "Design",
  "Brainstorm",
];

export const toneRows = [
  ["Professional", "Untuk update penting, technical writing, dan komunikasi yang perlu jelas."],
  ["Friendly", "Untuk membuat konten terasa dekat, ringan, dan mudah diikuti."],
  ["Enthusiastic", "Untuk launch, announcement, campaign, dan konten motivasional."],
  ["Empathetic", "Untuk support, edukasi sensitif, dan situasi ketika user butuh dimengerti."],
  ["Instructional", "Untuk SOP, tutorial, template kerja, dan proses yang perlu step-by-step."],
  ["Inspirational", "Untuk CTA, personal brand, dan narasi yang mendorong action."],
];

export const adminStats = [
  { label: "Prompt aktif", value: "128", icon: FileText },
  { label: "Kategori", value: "18", icon: FolderKanban },
  { label: "Member access", value: "742", icon: BookOpen },
  { label: "Copy bulan ini", value: "9.4k", icon: BarChart3 },
];

export const adminTasks = [
  "Atur link tombol registrasi ke halaman produk digital.",
  "Kelola akun superadmin dan user access dari Supabase Auth.",
  "Tambah kategori prompt untuk GPT, Claude, Gemini, image AI, video AI, dan agent.",
  "Publish prompt baru dengan tag, variable, model target, dan contoh output.",
  "Pantau prompt paling sering dibuka dan disalin member.",
];

export const sidebarItems = [
  { label: "All Prompts", icon: FileText, href: "#library-section" },
  { label: "Collections", icon: FolderKanban, href: "#collections-section" },
  { label: "Cheat Sheet", icon: BookOpen, href: "#cheat-sheet-section" },
  { label: "Tone Library", icon: MessageSquareText, href: "#tone-library-section" },
];
