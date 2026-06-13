import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { adminStats, brand, promptCategories, prompts } from "@/lib/content";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type IconName =
  | "bar-chart"
  | "book"
  | "bot"
  | "compass"
  | "file"
  | "folder"
  | "message"
  | "search"
  | "sparkles"
  | "wand";

export type PromptCategoryView = {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: IconName;
};

export type PromptView = {
  id: string;
  title: string;
  categoryId: string;
  category: string;
  categorySlug: string;
  model: string;
  tags: string[];
  body: string;
  isPublished: boolean;
  variables: Record<string, string>;
};

export type SiteSettingsView = {
  brandName: string;
  productUrl: string;
  supportEmail: string;
};

export type AdminStatView = {
  label: string;
  value: string;
  iconName: IconName;
};

export type PromptRequestView = {
  id: string;
  title: string;
  description: string;
  targetModel: string;
  status: string;
  requesterEmail: string;
  createdAt: string;
};

export type PromptInsightView = {
  promptId: string;
  title: string;
  category: string;
  model: string;
  copyCount: number;
};

export type AccessGrantView = {
  id: string;
  email: string;
  fullName: string;
  provider: string;
  productId: string;
  status: string;
  createdAt: string;
  userId: string;
};

export type PromptGeneratorView = {
  id: string;
  title: string;
  description: string;
  icon: IconName | string;
  form_schema: any;
  prompt_template: string;
  is_published: boolean;
  created_at: string;
  // v2 fields
  preview_image_url?: string;
  demo_values?: Record<string, string>;
  output_format?: "text" | "json";
};

export type PromptWorkspaceData = {
  categories: PromptCategoryView[];
  prompts: PromptView[];
  generators: PromptGeneratorView[];
  requests: PromptRequestView[];
  grants: AccessGrantView[];
  insights: PromptInsightView[];
  settings: SiteSettingsView;
  stats: AdminStatView[];
  source: "supabase" | "fallback";
};

type PromptCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type PromptRow = {
  id: string;
  category_id: string;
  title: string;
  body: string;
  ai_model: string | null;
  tags: string[] | null;
  is_published: boolean | null;
  variables: Record<string, string> | null;
  prompt_categories:
    | {
        name: string;
        slug: string;
      }
    | {
        name: string;
        slug: string;
      }[]
    | null;
};

type SiteSettingsRow = {
  brand_name: string | null;
  product_url: string | null;
  support_email: string | null;
};

type PromptRequestRow = {
  id: string;
  title: string;
  description: string;
  target_model: string | null;
  status: string | null;
  created_at: string;
  profiles:
    | {
        email: string | null;
      }
    | {
        email: string | null;
      }[]
    | null;
};

type PromptCopyEventRow = {
  prompt_id: string;
};

const categoryIconBySlug: Record<string, IconName> = {
  "content-ideas": "sparkles",
  strategy: "compass",
  research: "search",
  hooks: "wand",
  captions: "message",
  "ai-ops": "bot",
};

const statIconByLabel: Record<string, IconName> = {
  "Prompt aktif": "file",
  Kategori: "folder",
  "Member access": "book",
  "Copy bulan ini": "bar-chart",
};

function getCategoryIconName(slug: string): IconName {
  return categoryIconBySlug[slug] ?? "folder";
}

function getFallbackData(): PromptWorkspaceData {
  return {
    categories: promptCategories.map((category) => ({
      id: category.slug,
      name: category.name,
      slug: category.slug,
      description: category.description,
      iconName: getCategoryIconName(category.slug),
    })),
    prompts: prompts.map((prompt, index) => ({
      id: `${index}-${prompt.title.toLowerCase().replaceAll(" ", "-")}`,
      title: prompt.title,
      categoryId:
        promptCategories.find((category) => prompt.category.toLowerCase().includes(category.name.toLowerCase()))
          ?.slug ?? "content-ideas",
      category: prompt.category,
      categorySlug: prompt.category.toLowerCase().replaceAll(" ", "-"),
      model: prompt.model,
      tags: prompt.tags,
      body: prompt.body,
      isPublished: true,
      variables: {},
    })),
    generators: [],
    requests: [],
    grants: [],
    insights: prompts.slice(0, 4).map((prompt, index) => ({
      promptId: `${index}-${prompt.title.toLowerCase().replaceAll(" ", "-")}`,
      title: prompt.title,
      category: prompt.category,
      model: prompt.model,
      copyCount: [48, 36, 24, 18][index] ?? 12,
    })),
    settings: {
      brandName: brand.name,
      productUrl: brand.productUrl,
      supportEmail: brand.supportEmail,
    },
    stats: adminStats.map((stat) => ({
      label: stat.label,
      value: stat.value,
      iconName: statIconByLabel[stat.label] ?? "file",
    })),
    source: "fallback",
  };
}

async function createSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components can read cookies but cannot always write refreshed auth cookies.
        }
      },
    },
  });
}

function normalizeSettings(row: SiteSettingsRow | null): SiteSettingsView {
  return {
    brandName: row?.brand_name ?? brand.name,
    productUrl: row?.product_url ?? brand.productUrl,
    supportEmail: row?.support_email ?? brand.supportEmail,
  };
}

function normalizeCategory(row: PromptCategoryRow): PromptCategoryView {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    iconName: getCategoryIconName(row.slug),
  };
}

function getPromptCategory(row: PromptRow) {
  if (Array.isArray(row.prompt_categories)) {
    return row.prompt_categories[0] ?? null;
  }

  return row.prompt_categories;
}

function normalizePrompt(row: PromptRow): PromptView {
  const category = getPromptCategory(row);

  return {
    id: row.id,
    title: row.title,
    categoryId: row.category_id,
    category: category?.name ?? "Uncategorized",
    categorySlug: category?.slug ?? "uncategorized",
    model: row.ai_model ?? "All AI",
    tags: row.tags ?? [],
    body: row.body,
    isPublished: row.is_published ?? false,
    variables: row.variables ?? {},
  };
}

function getRequesterProfile(row: PromptRequestRow) {
  if (Array.isArray(row.profiles)) {
    return row.profiles[0] ?? null;
  }

  return row.profiles;
}

function normalizePromptRequest(row: PromptRequestRow): PromptRequestView {
  const profile = getRequesterProfile(row);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    targetModel: row.target_model ?? "All AI",
    status: row.status ?? "pending",
    requesterEmail: profile?.email ?? "Unknown member",
    createdAt: row.created_at,
  };
}

function formatCount(count: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    notation: count && count >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(count ?? 0);
}

function getPromptInsights(events: PromptCopyEventRow[], promptList: PromptView[]): PromptInsightView[] {
  const promptById = new Map(promptList.map((prompt) => [prompt.id, prompt]));
  const counts = events.reduce<Map<string, number>>((accumulator, event) => {
    accumulator.set(event.prompt_id, (accumulator.get(event.prompt_id) ?? 0) + 1);
    return accumulator;
  }, new Map());

  return [...counts.entries()]
    .map(([promptId, copyCount]) => {
      const prompt = promptById.get(promptId);

      if (!prompt) return null;

      return {
        promptId,
        title: prompt.title,
        category: prompt.category,
        model: prompt.model,
        copyCount,
      };
    })
    .filter((insight): insight is PromptInsightView => Boolean(insight))
    .sort((first, second) => second.copyCount - first.copyCount)
    .slice(0, 6);
}

export async function getPromptWorkspaceData(): Promise<PromptWorkspaceData> {
  const fallback = getFallbackData();
  const supabase = await createSupabaseServerClient();

  if (!supabase) return fallback;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    categoriesResult,
    promptsResult,
      settingsResult,
      promptCountResult,
      userCountResult,
      copyCountResult,
      requestsResult,
      copyEventsResult,
      grantsResult,
      generatorsResult,
    ] =
      await Promise.all([
        supabase
          .from("prompt_categories")
          .select("id,name,slug,description,sort_order")
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true }),
        supabase
          .from("prompts")
          .select("id,category_id,title,body,ai_model,tags,is_published,variables,prompt_categories(name,slug)")
          .order("created_at", { ascending: false }),
        supabase.from("site_settings").select("brand_name,product_url,support_email").eq("id", true).maybeSingle(),
        supabase.from("prompts").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "access"),
        supabase
          .from("prompt_copy_events")
          .select("id", { count: "exact", head: true })
          .gte("created_at", monthStart.toISOString()),
        supabase
          .from("prompt_requests")
          .select("id,title,description,target_model,status,created_at,profiles(email)")
          .order("created_at", { ascending: false })
          .limit(12),
        supabase
          .from("prompt_copy_events")
          .select("prompt_id")
          .gte("created_at", monthStart.toISOString())
          .limit(1000),
        supabase
          .from("access_grants")
          .select("id,email,full_name,provider,product_id,status,created_at,granted_user_id")
          .order("created_at", { ascending: false }),
        supabase
          .from("prompt_generators")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

  if (categoriesResult.error || promptsResult.error) {
    return fallback;
  }

  const categories = (categoriesResult.data as PromptCategoryRow[] | null)?.map(normalizeCategory) ?? [];
  const promptRows = (promptsResult.data as PromptRow[] | null) ?? [];
  const promptList = promptRows.map(normalizePrompt);
  const settingsRow = settingsResult.data as SiteSettingsRow | null;
  const requestRows = requestsResult.error ? [] : ((requestsResult.data as PromptRequestRow[] | null) ?? []);
  const copyEventRows = copyEventsResult.error ? [] : ((copyEventsResult.data as PromptCopyEventRow[] | null) ?? []);

  type AccessGrantRow = {
    id: string;
    email: string;
    full_name: string | null;
    provider: string;
    product_id: string | null;
    status: string;
    created_at: string;
    granted_user_id: string | null;
  };

  const normalizeAccessGrant = (row: AccessGrantRow): AccessGrantView => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name ?? "",
    provider: row.provider,
    productId: row.product_id ?? "",
    status: row.status,
    createdAt: row.created_at,
    userId: row.granted_user_id ?? "",
  });

  const grantsRows = !grantsResult || grantsResult.error ? [] : ((grantsResult.data as AccessGrantRow[] | null) ?? []);
  
  const generatorsRows = !generatorsResult || generatorsResult.error ? [] : (generatorsResult.data || []);
  const generatorsList: PromptGeneratorView[] = generatorsRows.map((g: any) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    icon: g.icon,
    form_schema: g.form_schema,
    prompt_template: g.prompt_template,
    is_published: g.is_published,
    created_at: g.created_at,
  }));

  return {
    categories,
    prompts: promptList,
    generators: generatorsList,
    requests: requestRows.map(normalizePromptRequest),
    grants: grantsRows.map(normalizeAccessGrant),
    insights: getPromptInsights(copyEventRows, promptList),
    settings: {
      ...normalizeSettings(settingsRow),
    },
    stats: [
      {
        label: "Prompt aktif",
        value: formatCount(promptCountResult.count ?? promptList.filter((prompt) => prompt.isPublished).length),
        iconName: "file",
      },
      {
        label: "Kategori",
        value: formatCount(categories.length),
        iconName: "folder",
      },
      {
        label: "Member access",
        value: formatCount(userCountResult.count),
        iconName: "book",
      },
      {
        label: "Copy bulan ini",
        value: formatCount(copyCountResult.count),
        iconName: "bar-chart",
      },
    ],
    source: "supabase",
  };
}

export async function getSiteSettingsData(): Promise<SiteSettingsView> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return normalizeSettings(null);
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("brand_name,product_url,support_email")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    return normalizeSettings(null);
  }

  return normalizeSettings(data as SiteSettingsRow | null);
}
