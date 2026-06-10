# PromptVault OS

Multi-AI prompt manager for premium digital product access.

## Run Locally

```bash
npm install
npm run dev
```

Default local URL:

```text
http://localhost:3000
```

If another app already uses port 3000:

```bash
npm run dev -- --port 3001
```

## Supabase Auth Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Fill these values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Run `supabase/schema.sql` in Supabase SQL Editor.
5. Run `supabase/seed.sql` if you want starter categories and prompt examples.
6. Create users in Supabase Auth.

New Auth users automatically get a row in `profiles` with role `access`.

To make your first superadmin, run this in Supabase SQL Editor after creating your own Auth user:

```sql
update public.profiles
set role = 'superadmin'
where email = 'your-email@example.com';
```

## Current Routes

- `/` - public landing page
- `/login` - Supabase email/password login
- `/library` - protected prompt library for authenticated users
- `/superadmin` - protected console for users with `profiles.role = 'superadmin'`

## Route Protection

Next.js Proxy protects these routes from `src/proxy.ts`:

- `/library` requires a valid Supabase session.
- `/superadmin` requires a valid Supabase session and `profiles.role = 'superadmin'`.

If Supabase env values are missing, protected routes redirect to `/login`.

## Data Source

Library and superadmin pages read from Supabase through `src/lib/prompt-data.ts`.
If Supabase env values are missing, the app falls back to local demo data so the UI can still be developed.

## Superadmin CMS

The superadmin page includes CRUD controls for:

- Prompt categories
- Prompts
- Prompt model labels
- Tags
- Published/draft status

Writes use the browser Supabase client and are protected by the `public.is_superadmin()` RLS policies in `supabase/schema.sql`.

Superadmin can also update public settings stored in `site_settings`:

- Brand name
- Product URL for `Beli Access`
- Support email

The public landing and login pages read the latest product URL from Supabase, with local fallback data when Supabase is not configured.

## Access Grants

Superadmin can grant access manually from the dashboard. The app also exposes a generic product webhook:

```text
POST /api/access/grant
```

Headers for product webhook calls:

```text
Authorization: Bearer YOUR_PRODUCT_WEBHOOK_SECRET
```

Example body:

```json
{
  "email": "buyer@example.com",
  "fullName": "Buyer Name",
  "provider": "product-platform",
  "productId": "prompt-vault-pro",
  "metadata": {
    "orderId": "ORDER-123"
  }
}
```

The route requires `SUPABASE_SERVICE_ROLE_KEY`. It invites the buyer if no Auth user exists, upserts `profiles.role = 'access'`, and records the action in `access_grants`.

## Member Experience

The protected library includes member actions backed by Supabase:

- Favorite prompts with `prompt_favorites`
- Copy prompt tracking with `prompt_copy_events`
- Prompt requests from members with `prompt_requests`

Superadmin can review prompt requests from the dashboard and update their status.

## Product Ops Analytics

The superadmin dashboard reads `prompt_copy_events` to show the most-copied prompts for the current month. The first implementation computes the ranking in `src/lib/prompt-data.ts` from recent copy events, which keeps setup simple for MVP usage.
