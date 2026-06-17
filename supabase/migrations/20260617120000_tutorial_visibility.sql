alter table public.blog_posts
add column if not exists visibility text not null default 'public';

alter table public.blog_posts
drop constraint if exists blog_posts_visibility_check;

alter table public.blog_posts
add constraint blog_posts_visibility_check
check (visibility in ('public', 'members'));

update public.blog_posts
set visibility = 'public'
where status = 'published';

drop policy if exists "blog_posts_read_published" on public.blog_posts;
drop policy if exists "blog_posts_read_public" on public.blog_posts;
drop policy if exists "blog_posts_read_authenticated" on public.blog_posts;

create policy "blog_posts_read_public"
on public.blog_posts for select
to anon
using (status = 'published' and visibility = 'public');

create policy "blog_posts_read_authenticated"
on public.blog_posts for select
to authenticated
using (status = 'published' or public.is_superadmin());
