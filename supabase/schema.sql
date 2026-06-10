create type public.user_role as enum ('superadmin', 'access');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'access',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id boolean primary key default true,
  brand_name text not null default 'PromptVault OS',
  product_url text not null default 'https://example.com/produk-prompt-manager',
  support_email text,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id)
);

create table public.prompt_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.prompt_categories(id) on delete restrict,
  title text not null,
  body text not null,
  ai_model text not null default 'All AI',
  tags text[] not null default '{}',
  variables jsonb not null default '{}'::jsonb,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prompt_favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

create table public.prompt_copy_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.prompt_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  target_model text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.access_grants (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  provider text not null default 'manual',
  product_id text,
  status text not null default 'granted',
  metadata jsonb not null default '{}'::jsonb,
  granted_user_id uuid references public.profiles(id) on delete set null,
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.prompt_categories enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_favorites enable row level security;
alter table public.prompt_copy_events enable row level security;
alter table public.prompt_requests enable row level security;
alter table public.access_grants enable row level security;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'superadmin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'full_name',
    'access'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create policy "profiles_select_own_or_superadmin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_superadmin());

create policy "profiles_update_own_or_superadmin"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.is_superadmin())
with check (id = auth.uid() or public.is_superadmin());

create policy "site_settings_read_all"
on public.site_settings for select
to anon, authenticated
using (true);

create policy "site_settings_superadmin_write"
on public.site_settings for all
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

create policy "categories_read_access"
on public.prompt_categories for select
to authenticated
using (true);

create policy "categories_superadmin_write"
on public.prompt_categories for all
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

create policy "prompts_read_access"
on public.prompts for select
to authenticated
using (is_published or public.is_superadmin());

create policy "prompts_superadmin_write"
on public.prompts for all
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

create policy "favorites_own_access"
on public.prompt_favorites for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "copy_events_insert_own"
on public.prompt_copy_events for insert
to authenticated
with check (user_id = auth.uid());

create policy "copy_events_select_own_or_superadmin"
on public.prompt_copy_events for select
to authenticated
using (user_id = auth.uid() or public.is_superadmin());

create policy "prompt_requests_insert_own"
on public.prompt_requests for insert
to authenticated
with check (user_id = auth.uid());

create policy "prompt_requests_select_own_or_superadmin"
on public.prompt_requests for select
to authenticated
using (user_id = auth.uid() or public.is_superadmin());

create policy "prompt_requests_superadmin_update"
on public.prompt_requests for update
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

create policy "access_grants_superadmin_read"
on public.access_grants for select
to authenticated
using (public.is_superadmin());

create policy "access_grants_superadmin_write"
on public.access_grants for all
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

insert into public.site_settings (id, brand_name, product_url, support_email)
values (true, 'PromptVault OS', 'https://example.com/produk-prompt-manager', 'support@promptvault.local')
on conflict (id) do nothing;
