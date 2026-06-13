import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(filePath) {
  const content = readFileSync(filePath, "utf8");
  const entries = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    const rawValue = valueParts.join("=").trim();
    entries[key.trim()] = rawValue.replace(/^["']|["']$/g, "");
  }

  return entries;
}

async function supabaseRequest(url, anonKey, serviceRoleKey, path, options = {}) {
  const response = await fetch(`${url}/auth/v1${path}`, {
    ...options,
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.msg ?? data?.message ?? `Supabase request failed with ${response.status}`);
  }

  return data;
}

async function main() {
  const [, , email, password] = process.argv;

  if (!email || !password) {
    throw new Error("Usage: node scripts/set-admin-password.mjs admin@example.com NewPassword123!");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const env = loadEnvFile(resolve(process.cwd(), ".env.local"));
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }

  const users = await supabaseRequest(
    supabaseUrl,
    anonKey,
    serviceRoleKey,
    `/admin/users?page=1&per_page=1000`,
    { method: "GET" },
  );
  const user = users?.users?.find((item) => item.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  await supabaseRequest(supabaseUrl, anonKey, serviceRoleKey, `/admin/users/${user.id}`, {
    method: "PUT",
    body: JSON.stringify({
      password,
      email_confirm: true,
      user_metadata: {
        ...(user.user_metadata ?? {}),
        full_name: user.user_metadata?.full_name ?? "PromptVault Admin",
      },
    }),
  });

  console.log(`Password updated for ${email}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
