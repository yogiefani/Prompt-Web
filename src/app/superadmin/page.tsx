import { getPromptWorkspaceData } from "@/lib/prompt-data";
import { SuperadminDashboard } from "@/components/superadmin-dashboard";

export const dynamic = "force-dynamic";

export default async function SuperadminPage() {
  const workspace = await getPromptWorkspaceData();

  return (
    <main className="min-h-screen bg-[var(--color-sky-wash)] text-[var(--color-obsidian)]">
      <SuperadminDashboard workspace={workspace} />
    </main>
  );
}
