"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import {
  AlignLeft,
  Bold,
  ChevronDown,
  Code,
  Eye,
  FileText,
  Globe,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Save,
  Tag,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type BlogPostStatus = "draft" | "published";

type BlogEditorProps = {
  initialPost?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverUrl: string;
    content: string;
    tags: string[];
    readTime: number;
    status: BlogPostStatus;
  } | null;
  onSaved: () => void;
  onCancel: () => void;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

type ToolbarButtonProps = {
  title: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function ToolbarButton({ title, active, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
        active
          ? "bg-[var(--color-midnight-ink)] text-white"
          : "text-[var(--color-silver-pine)] hover:bg-[var(--color-arctic-mist)] hover:text-[var(--color-obsidian)]"
      }`}
    >
      {children}
    </button>
  );
}

export function BlogEditor({ initialPost, onSaved, onCancel }: BlogEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);
  
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [coverUrl, setCoverUrl] = useState(initialPost?.coverUrl ?? "");
  const [status, setStatus] = useState<BlogPostStatus>(initialPost?.status ?? "draft");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialPost?.tags ?? []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showMetadata, setShowMetadata] = useState(false);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

  // Image Selection Effect
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    function handleEditorClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        setSelectedImage(target as HTMLImageElement);
      } else {
        setSelectedImage(null);
      }
    }
    function handleOther() {
      if (selectedImage) setSelectedImage(null);
    }

    editor.addEventListener("click", handleEditorClick);
    editor.addEventListener("keydown", handleOther);
    return () => {
      editor.removeEventListener("click", handleEditorClick);
      editor.removeEventListener("keydown", handleOther);
    };
  }, [mode, selectedImage]);

  function applyImageSize(sizeClass: "blog-img-small" | "blog-img-medium" | "blog-img-full") {
    if (!selectedImage) return;
    const figure = selectedImage.closest("figure");
    if (figure) {
      figure.classList.remove("blog-img-small", "blog-img-medium", "blog-img-full");
      figure.classList.add(sizeClass);
    }
    setSelectedImage(null);
  }

  // Sync content to editorRef on mount
  useEffect(() => {
    if (editorRef.current && initialPost?.content) {
      editorRef.current.innerHTML = initialPost.content;
    }
  }, [initialPost?.content]);

  // Auto-generate slug when title changes (only for new posts)
  useEffect(() => {
    if (!initialPost) {
      setSlug(slugify(title));
    }
  }, [title, initialPost]);

  function execFormat(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  }

  function formatHeading(level: "h1" | "h2" | "h3" | "blockquote") {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, level);
  }

  function insertHr() {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, "<hr/><p><br/></p>");
  }

  function insertLink() {
    const url = window.prompt("Masukkan URL:", "https://");
    if (url) execFormat("createLink", url);
  }

  function triggerInlineUpload() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSavedRange(selection.getRangeAt(0));
    }
    inlineInputRef.current?.click();
  }

  async function handleInlineUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingInline(true);
    try {
      const url = await uploadImageToCloudinary(file);
      editorRef.current?.focus();
      const selection = window.getSelection();
      if (savedRange && selection) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
      }
      document.execCommand(
        "insertHTML",
        false,
        `<figure class="blog-figure blog-img-medium"><img src="${url}" alt="" class="blog-img" /><figcaption contenteditable="true" class="blog-caption">Keterangan gambar...</figcaption></figure><p><br/></p>`
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingInline(false);
      if (inlineInputRef.current) inlineInputRef.current.value = "";
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setCoverUrl(url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  function insertCodeBlock() {
    execFormat(
      "insertHTML",
      `<pre class="blog-pre"><code contenteditable="true">// Paste your code here</code></pre><p><br/></p>`
    );
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  const getContent = useCallback(() => {
    return editorRef.current?.innerHTML ?? "";
  }, []);

  async function handleSave() {
    if (!supabase) {
      setMessage("Supabase tidak terkonfigurasi.");
      return;
    }
    if (!title.trim()) {
      setMessage("Judul tidak boleh kosong.");
      return;
    }
    if (!slug.trim()) {
      setMessage("Slug tidak boleh kosong.");
      return;
    }

    const content = getContent();
    const readTime = estimateReadTime(content);
    setSaving(true);
    setMessage("");

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      cover_url: coverUrl.trim(),
      content,
      tags,
      read_time: readTime,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (initialPost?.id) {
      ({ error } = await supabase.from("blog_posts").update(payload).eq("id", initialPost.id));
    } else {
      ({ error } = await supabase.from("blog_posts").insert({ ...payload, created_at: new Date().toISOString() }));
    }

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    onSaved();
  }

  return (
    <div className="flex flex-col gap-0 rounded-[32px] overflow-hidden bg-white shadow-[var(--shadow-lg)] border border-[rgba(83,88,98,0.1)]">
      <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
      <input type="file" ref={inlineInputRef} className="hidden" accept="image/*" onChange={handleInlineUpload} />
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-[rgba(83,88,98,0.12)] bg-[var(--color-arctic-mist)] px-5 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--color-electric-blue)]" />
          <span className="text-sm font-bold text-[var(--color-obsidian)]">
            {initialPost ? "Edit Artikel" : "Artikel Baru"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Status toggle */}
          <button
            type="button"
            onClick={() => setStatus((s) => (s === "draft" ? "published" : "draft"))}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              status === "published"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${status === "published" ? "bg-emerald-500" : "bg-amber-500"}`} />
            {status === "published" ? "Published" : "Draft"}
          </button>

          {/* View toggle */}
          <div className="flex rounded-xl border border-[rgba(83,88,98,0.14)] overflow-hidden">
            <button
              type="button"
              onClick={() => setMode("write")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${
                mode === "write" ? "bg-[var(--color-midnight-ink)] text-white" : "bg-white text-[var(--color-silver-pine)]"
              }`}
            >
              <AlignLeft className="h-3.5 w-3.5" /> Tulis
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${
                mode === "preview" ? "bg-[var(--color-midnight-ink)] text-white" : "bg-white text-[var(--color-silver-pine)]"
              }`}
            >
              <Eye className="h-3.5 w-3.5" /> Preview
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowMetadata((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-[rgba(83,88,98,0.14)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-silver-pine)] transition-all hover:text-[var(--color-obsidian)]"
          >
            <Tag className="h-3.5 w-3.5" />
            Metadata
            <ChevronDown className={`h-3 w-3 transition-transform ${showMetadata ? "rotate-180" : ""}`} />
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--color-silver-pine)] hover:bg-red-50 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metadata Panel */}
      {showMetadata && (
        <div className="grid gap-4 border-b border-[rgba(83,88,98,0.12)] bg-[var(--color-sky-wash)] px-6 py-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-[0.07em] text-[var(--color-silver-pine)]">
            Slug URL
            <input
              className="form-input text-sm font-normal normal-case tracking-normal"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="judul-artikel-saya"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-[0.07em] text-[var(--color-silver-pine)]">
            Cover Image URL
            <div className="flex gap-2">
              <input
                className="form-input flex-1 text-sm font-normal normal-case tracking-normal"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="shrink-0 rounded-xl bg-[var(--color-obsidian)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--color-midnight-ink)] disabled:opacity-50"
              >
                {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
              </button>
            </div>
          </label>
          <label className="col-span-full flex flex-col gap-1.5 text-xs font-bold uppercase tracking-[0.07em] text-[var(--color-silver-pine)]">
            Excerpt (ringkasan)
            <textarea
              className="form-input min-h-[72px] resize-y text-sm font-normal normal-case tracking-normal"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Deskripsi singkat artikel ini..."
            />
          </label>
          <div className="col-span-full flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.07em] text-[var(--color-silver-pine)]">Tags</span>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-whisper-fade-blue)] px-3 py-1 text-xs font-semibold text-[var(--color-electric-blue)]"
                >
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                className="rounded-xl border border-[rgba(83,88,98,0.18)] px-3 py-1.5 text-xs font-semibold outline-none"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                placeholder="Tambah tag + Enter"
              />
            </div>
          </div>
        </div>
      )}

      {/* Cover preview */}
      {coverUrl && mode === "write" && (
        <div className="relative h-52 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverUrl} alt="Cover" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <div className="flex flex-1 flex-col">
        {/* Title */}
        <div className="px-6 pt-8 pb-2">
          <input
            className="w-full bg-transparent font-aeonik text-4xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-obsidian)] outline-none placeholder:text-[rgba(0,0,0,0.2)]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul artikel..."
          />
        </div>

        <div style={{ display: mode === "write" ? "block" : "none" }}>
          {/* Toolbar */}
          <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-y border-[rgba(83,88,98,0.1)] bg-white/90 px-4 py-2 backdrop-blur-sm">
            <ToolbarButton title="Bold" onClick={() => execFormat("bold")}><Bold className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton title="Italic" onClick={() => execFormat("italic")}><Italic className="h-4 w-4" /></ToolbarButton>
            <div className="mx-1 h-5 w-px bg-[rgba(83,88,98,0.18)]" />
            <ToolbarButton title="Heading 1" onClick={() => formatHeading("h1")}><Heading1 className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton title="Heading 2" onClick={() => formatHeading("h2")}><Heading2 className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton title="Heading 3" onClick={() => formatHeading("h3")}><Heading3 className="h-4 w-4" /></ToolbarButton>
            <div className="mx-1 h-5 w-px bg-[rgba(83,88,98,0.18)]" />
            <ToolbarButton title="Blockquote" onClick={() => formatHeading("blockquote")}><Quote className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton title="Code Block" onClick={insertCodeBlock}><Code className="h-4 w-4" /></ToolbarButton>
            <div className="mx-1 h-5 w-px bg-[rgba(83,88,98,0.18)]" />
            <ToolbarButton title="Bullet List" onClick={() => execFormat("insertUnorderedList")}><List className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton title="Numbered List" onClick={() => execFormat("insertOrderedList")}><ListOrdered className="h-4 w-4" /></ToolbarButton>
            <div className="mx-1 h-5 w-px bg-[rgba(83,88,98,0.18)]" />
            <ToolbarButton title="Link" onClick={insertLink}><Link className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton title="Upload Gambar" onClick={triggerInlineUpload}>
              {uploadingInline ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
            </ToolbarButton>
            <ToolbarButton title="Horizontal Rule" onClick={insertHr}><Minus className="h-4 w-4" /></ToolbarButton>
          </div>

          {/* Image Resize Sub-Toolbar */}
          {selectedImage && (
            <div className="flex items-center gap-3 border-b border-[rgba(83,88,98,0.1)] bg-[var(--color-sky-wash)] px-5 py-2 text-xs font-semibold text-[var(--color-obsidian)]">
              <span className="text-[var(--color-silver-pine)]">Ukuran Gambar:</span>
              <button type="button" onClick={() => applyImageSize("blog-img-small")} className="rounded-lg border border-[rgba(83,88,98,0.2)] bg-white px-3 py-1.5 transition-colors hover:bg-[var(--color-arctic-mist)] hover:text-[var(--color-electric-blue)]">Kecil</button>
              <button type="button" onClick={() => applyImageSize("blog-img-medium")} className="rounded-lg border border-[rgba(83,88,98,0.2)] bg-white px-3 py-1.5 transition-colors hover:bg-[var(--color-arctic-mist)] hover:text-[var(--color-electric-blue)]">Sedang</button>
              <button type="button" onClick={() => applyImageSize("blog-img-full")} className="rounded-lg border border-[rgba(83,88,98,0.2)] bg-white px-3 py-1.5 transition-colors hover:bg-[var(--color-arctic-mist)] hover:text-[var(--color-electric-blue)]">Penuh</button>
            </div>
          )}

          {/* Editor area */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="blog-content min-h-[460px] flex-1 cursor-text px-6 py-6 text-[var(--color-obsidian)] outline-none"
            data-placeholder="Mulai menulis artikel tutorial di sini..."
            onInput={() => {/* keep reactive if needed */}}
          />
        </div>

        {mode === "preview" && (
          /* Preview */
          <div className="blog-content min-h-[460px] px-6 py-6">
            {coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="Cover" className="blog-img mb-8" />
            )}
            <div
              dangerouslySetInnerHTML={{ __html: getContent() }}
            />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-4 border-t border-[rgba(83,88,98,0.12)] bg-[var(--color-arctic-mist)] px-6 py-4">
        {message ? (
          <p className="text-sm font-semibold text-red-500">{message}</p>
        ) : (
          <p className="text-xs font-medium text-[var(--color-silver-pine)]">
            <Globe className="mr-1.5 inline h-3.5 w-3.5" />
            {status === "published" ? "Artikel akan langsung terlihat oleh semua member." : "Simpan sebagai draft — hanya superadmin yang bisa melihat."}
          </p>
        )}
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="secondary-button">
            Batal
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="primary-button">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {status === "published" ? "Publish" : "Simpan Draft"}
          </button>
        </div>
      </div>
    </div>
  );
}
