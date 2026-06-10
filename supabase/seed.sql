insert into public.prompt_categories (name, slug, description, sort_order)
values
  ('Content Ideas', 'content-ideas', 'Ide konten, angle, seri, dan kalender publikasi.', 10),
  ('Strategy', 'strategy', 'Positioning, funnel, offer, dan campaign planning.', 20),
  ('Research', 'research', 'Audience insight, competitor scan, dan market mapping.', 30),
  ('Hooks', 'hooks', 'Opening line, curiosity gap, dan short-form hook.', 40),
  ('Captions', 'captions', 'Caption, hashtag, CTA, dan micro-copy social media.', 50),
  ('AI Ops', 'ai-ops', 'Prompt untuk GPT, Claude, Gemini, image, video, dan agent.', 60)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.prompts (category_id, title, body, ai_model, tags, is_featured, is_published)
select
  category.id,
  seed.title,
  seed.body,
  seed.ai_model,
  seed.tags,
  seed.is_featured,
  true
from (
  values
    (
      'content-ideas',
      'Audience Pain Finder',
      'Saya membuat konten untuk [deskripsi audiens]. Berikan 50 masalah yang mungkin dimiliki audiens ini. Sertakan campuran masalah praktis, emosional, finansial, dan sosial.',
      'GPT / Claude',
      array['research', 'content'],
      true
    ),
    (
      'strategy',
      'Topic Cluster Builder',
      'Saya membuat konten tentang [topik luas]. Pisahkan topik tersebut menjadi 10 topik kecil, lalu buat 20 ide posting untuk setiap topik dengan sudut pandang berbeda.',
      'All text AI',
      array['seo', 'planning'],
      true
    ),
    (
      'hooks',
      'Hook Rewriter',
      'Saya baru menulis postingan ini: [teks]. Buat 15 kalimat pembuka yang lebih kuat, singkat, persuasif, dan menarik perhatian dalam gaya [tone].',
      'GPT / Gemini',
      array['hook', 'short-form'],
      true
    ),
    (
      'captions',
      'Instagram Carousel Script',
      'Buat script carousel 8 slide tentang [topik]. Slide pertama harus memancing rasa penasaran, slide tengah edukatif, dan slide terakhir berisi CTA yang natural.',
      'All text AI',
      array['instagram', 'carousel'],
      false
    ),
    (
      'strategy',
      'Offer Clarity Audit',
      'Audit penawaran ini: [deskripsi offer]. Nilai kejelasan target market, problem, promise, proof, mechanism, pricing logic, dan CTA. Beri skor 1-10 dan rekomendasi revisi.',
      'Claude',
      array['offer', 'sales'],
      false
    ),
    (
      'research',
      'Competitor Angle Map',
      'Analisis 5 kompetitor di niche [niche]. Temukan angle konten mereka, kelemahan positioning, keyword yang sering muncul, dan peluang konten yang belum banyak disentuh.',
      'Gemini / Perplexity',
      array['competitor', 'market'],
      false
    ),
    (
      'ai-ops',
      'AI Image Prompt Brief',
      'Ubah brief visual ini menjadi prompt image AI yang detail: [brief]. Sertakan subject, environment, camera, lighting, composition, texture, color palette, dan negative prompt.',
      'Image AI',
      array['image', 'creative'],
      false
    ),
    (
      'strategy',
      'Long Form Repurposer',
      'Ubah artikel/video berikut menjadi 12 aset konten: 3 thread, 3 carousel, 3 short video script, dan 3 email. Pertahankan ide utama dan sesuaikan format setiap channel.',
      'GPT / Claude',
      array['repurpose', 'workflow'],
      false
    )
) as seed(slug, title, body, ai_model, tags, is_featured)
join public.prompt_categories category on category.slug = seed.slug
where not exists (
  select 1
  from public.prompts existing
  where existing.title = seed.title
);
