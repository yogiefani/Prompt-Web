-- Migration: Community Forum Tables & Policies
-- Created: 2026-06-18

-- 1. Create tables
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  category text not null default 'General',
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_post_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

-- 2. Enable Row Level Security (RLS)
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_post_likes enable row level security;

-- 3. Drop existing policies if any
drop policy if exists "posts_read_all" on public.community_posts;
drop policy if exists "posts_insert_own" on public.community_posts;
drop policy if exists "posts_update_own_or_superadmin" on public.community_posts;
drop policy if exists "posts_delete_own_or_superadmin" on public.community_posts;

drop policy if exists "comments_read_all" on public.community_comments;
drop policy if exists "comments_insert_own" on public.community_comments;
drop policy if exists "comments_delete_own_or_superadmin" on public.community_comments;

drop policy if exists "likes_read_all" on public.community_post_likes;
drop policy if exists "likes_insert_own" on public.community_post_likes;
drop policy if exists "likes_delete_own" on public.community_post_likes;

-- 4. Create RLS policies
-- Community Posts
create policy "posts_read_all"
on public.community_posts for select
to authenticated
using (true);

create policy "posts_insert_own"
on public.community_posts for insert
to authenticated
with check (user_id = auth.uid());

create policy "posts_update_own_or_superadmin"
on public.community_posts for update
to authenticated
using (user_id = auth.uid() or public.is_superadmin())
with check (user_id = auth.uid() or public.is_superadmin());

create policy "posts_delete_own_or_superadmin"
on public.community_posts for delete
to authenticated
using (user_id = auth.uid() or public.is_superadmin());

-- Community Comments
create policy "comments_read_all"
on public.community_comments for select
to authenticated
using (true);

create policy "comments_insert_own"
on public.community_comments for insert
to authenticated
with check (user_id = auth.uid());

create policy "comments_delete_own_or_superadmin"
on public.community_comments for delete
to authenticated
using (user_id = auth.uid() or public.is_superadmin());

-- Community Post Likes
create policy "likes_read_all"
on public.community_post_likes for select
to authenticated
using (true);

create policy "likes_insert_own"
on public.community_post_likes for insert
to authenticated
with check (user_id = auth.uid());

create policy "likes_delete_own"
on public.community_post_likes for delete
to authenticated
using (user_id = auth.uid());

-- 5. Helper function and triggers to update `updated_at` automatically
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_community_posts_updated_at on public.community_posts;
create trigger update_community_posts_updated_at
before update on public.community_posts
for each row execute function public.update_updated_at_column();

drop trigger if exists update_community_comments_updated_at on public.community_comments;
create trigger update_community_comments_updated_at
before update on public.community_comments
for each row execute function public.update_updated_at_column();
