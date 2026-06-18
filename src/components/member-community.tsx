"use client";

import { FormEvent, useState, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Search, 
  ThumbsUp, 
  Pin, 
  Lock, 
  Unlock, 
  Trash2, 
  CornerDownRight, 
  ArrowLeft,
  Users,
  MessageCircle,
  PlusCircle,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FadeIn, LiftCard, Stagger } from "@/components/motion-primitives";

type Profile = {
  email: string;
  full_name: string;
  role: "superadmin" | "access";
};

type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  user_id: string;
  profiles: Profile | null;
  community_comments: { id: string }[];
  community_post_likes: { user_id: string }[];
  likes_count: number;
  comments_count: number;
  has_liked: boolean;
};

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: Profile | null;
};

type MemberCommunityProps = {
  source: "supabase" | "fallback";
  isSuperadmin: boolean;
  initialPostId?: string;
};

const CATEGORIES = [
  { value: "Showcase", label: "💡 Ide / Showcase", color: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" },
  { value: "Tanya Jawab", label: "❓ Tanya Jawab", color: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" },
  { value: "Tips & Prompt", label: "🔥 Tips & Prompt", color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" },
  { value: "Obrolan", label: "💬 Obrolan", color: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20" }
];

export function MemberCommunity({ source, isSuperadmin, initialPostId }: MemberCommunityProps) {
  // Navigation / views
  const [selectedPostId, setSelectedPostId] = useState<string | null>(initialPostId || null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Lists & data
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  // Loading states
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Filters & query
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState<"terbaru" | "upvote">("terbaru");

  // Form states
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("Showcase");
  const [postContent, setPostContent] = useState("");
  const [commentContent, setCommentContent] = useState("");

  // Error/Success status
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [source, currentUser]);

  useEffect(() => {
    if (selectedPostId) {
      fetchComments(selectedPostId);
      // Clean up notifications if it was opened from notification URL
      markNotificationAsReadForPost(selectedPostId);
    }
  }, [selectedPostId]);

  async function fetchCurrentUser() {
    if (source !== "supabase" || !supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name, role")
          .eq("id", user.id)
          .single();
        if (profile) {
          setCurrentProfile(profile);
        }
      }
    } catch (err) {
      console.error("Gagal mendapatkan user:", err);
    }
  }

  async function fetchPosts() {
    if (source !== "supabase" || !supabase) {
      // Fallback dummy data
      setPosts(getFallbackPosts());
      setLoadingPosts(false);
      return;
    }

    try {
      setLoadingPosts(true);
      const { data, error } = await supabase
        .from("community_posts")
        .select(`
          id, title, content, category, is_pinned, is_locked, created_at, user_id,
          profiles (email, full_name, role),
          community_comments (id),
          community_post_likes (user_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const userId = currentUser?.id;
        const formattedPosts: Post[] = data.map((item: any) => {
          const rawComments = item.community_comments || [];
          const rawLikes = item.community_post_likes || [];
          
          let profileObj: Profile | null = null;
          if (item.profiles) {
            profileObj = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
          }

          return {
            id: item.id,
            title: item.title,
            content: item.content,
            category: item.category,
            is_pinned: item.is_pinned,
            is_locked: item.is_locked,
            created_at: item.created_at,
            user_id: item.user_id,
            profiles: profileObj,
            community_comments: rawComments,
            community_post_likes: rawLikes,
            likes_count: rawLikes.length,
            comments_count: rawComments.length,
            has_liked: userId ? rawLikes.some((like: any) => like.user_id === userId) : false,
          };
        });

        setPosts(formattedPosts);
      }
    } catch (err) {
      console.error("Gagal mengambil data diskusi:", err);
    } finally {
      setLoadingPosts(false);
    }
  }

  async function fetchComments(postId: string) {
    if (source !== "supabase" || !supabase) {
      // Fallback comments
      setComments(getFallbackComments(postId));
      return;
    }

    try {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from("community_comments")
        .select(`
          id, post_id, user_id, content, created_at,
          profiles (email, full_name, role)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedComments: Comment[] = data.map((c: any) => {
          let profileObj: Profile | null = null;
          if (c.profiles) {
            profileObj = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
          }
          return {
            id: c.id,
            post_id: c.post_id,
            user_id: c.user_id,
            content: c.content,
            created_at: c.created_at,
            profiles: profileObj,
          };
        });
        setComments(formattedComments);
      }
    } catch (err) {
      console.error("Gagal mengambil komentar:", err);
    } finally {
      setLoadingComments(false);
    }
  }

  async function markNotificationAsReadForPost(postId: string) {
    if (source !== "supabase" || !supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find notifications containing the link for this post and update as read
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .like("link_url", `%postId=${postId}%`);
    } catch (err) {
      console.error("Gagal memperbarui status notifikasi:", err);
    }
  }

  async function handleCreatePost(e: FormEvent) {
    e.preventDefault();
    if (!currentUser) {
      setStatusMessage({ text: "Anda harus login terlebih dahulu.", type: "error" });
      return;
    }

    if (source !== "supabase" || !supabase) {
      // Offline mode preview
      const newPost: Post = {
        id: Math.random().toString(),
        title: postTitle,
        content: postContent,
        category: postCategory,
        is_pinned: false,
        is_locked: false,
        created_at: new Date().toISOString(),
        user_id: currentUser.id,
        profiles: currentProfile || { email: "user@example.com", full_name: "Mock Member", role: "access" },
        community_comments: [],
        community_post_likes: [],
        likes_count: 0,
        comments_count: 0,
        has_liked: false
      };
      setPosts([newPost, ...posts]);
      setPostTitle("");
      setPostContent("");
      setShowCreateForm(false);
      setStatusMessage({ text: "Postingan berhasil dibuat (Offline Mode)!", type: "success" });
      return;
    }

    try {
      setSubmittingPost(true);
      setStatusMessage(null);

      const { error } = await supabase.from("community_posts").insert({
        user_id: currentUser.id,
        title: postTitle,
        content: postContent,
        category: postCategory,
      });

      if (error) throw error;

      setPostTitle("");
      setPostContent("");
      setShowCreateForm(false);
      setStatusMessage({ text: "Diskusi baru berhasil dipublikasikan!", type: "success" });
      
      // Refresh
      fetchPosts();

      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Gagal membuat postingan.", type: "error" });
    } finally {
      setSubmittingPost(false);
    }
  }

  async function handleCreateComment(e: FormEvent) {
    e.preventDefault();
    if (!currentUser || !selectedPostId) return;

    const post = posts.find((p) => p.id === selectedPostId);
    if (post?.is_locked && !isSuperadmin) {
      setStatusMessage({ text: "Diskusi ini telah dikunci oleh admin.", type: "error" });
      return;
    }

    if (source !== "supabase" || !supabase) {
      // Offline mode
      const newComment: Comment = {
        id: Math.random().toString(),
        post_id: selectedPostId,
        user_id: currentUser.id,
        content: commentContent,
        created_at: new Date().toISOString(),
        profiles: currentProfile || { email: "user@example.com", full_name: "Mock Member", role: "access" }
      };
      setComments([...comments, newComment]);
      setCommentContent("");
      return;
    }

    try {
      setSubmittingComment(true);
      
      const { error } = await supabase.from("community_comments").insert({
        post_id: selectedPostId,
        user_id: currentUser.id,
        content: commentContent,
      });

      if (error) throw error;

      setCommentContent("");
      fetchComments(selectedPostId);

      // Update local comment count in main state
      setPosts(posts.map((p) => p.id === selectedPostId ? { ...p, comments_count: p.comments_count + 1 } : p));

      // Trigger notification for the author of the post (if not yourself)
      if (post && post.user_id !== currentUser.id) {
        const commenterName = currentProfile?.full_name || "Seseorang";
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          title: "Komentar Baru 💬",
          message: `${commenterName} mengomentari diskusi Anda: "${post.title.substring(0, 30)}..."`,
          type: "request_update",
          is_read: false,
          link_url: `/library?tab=community&postId=${post.id}`
        });
      }
    } catch (err: any) {
      console.error("Gagal mengirim komentar:", err);
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleToggleLike(postId: string, hasLiked: boolean) {
    if (!currentUser) return;

    // Optimistic Update
    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            has_liked: !hasLiked,
            likes_count: hasLiked ? p.likes_count - 1 : p.likes_count + 1,
          };
        }
        return p;
      })
    );

    if (source !== "supabase" || !supabase) return;

    try {
      if (hasLiked) {
        // Unlike
        await supabase
          .from("community_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUser.id);
      } else {
        // Like
        await supabase
          .from("community_post_likes")
          .insert({
            post_id: postId,
            user_id: currentUser.id,
          });
      }
    } catch (err) {
      console.error("Gagal memproses like:", err);
      // Revert if failed
      fetchPosts();
    }
  }

  // Admin moderation actions
  async function handleTogglePin(postId: string, isPinned: boolean) {
    if (!isSuperadmin || source !== "supabase" || !supabase) return;

    try {
      const { error } = await supabase
        .from("community_posts")
        .update({ is_pinned: !isPinned })
        .eq("id", postId);

      if (error) throw error;

      setPosts(
        posts.map((p) => (p.id === postId ? { ...p, is_pinned: !isPinned } : p))
      );
    } catch (err) {
      console.error("Gagal mengubah status pin:", err);
    }
  }

  async function handleToggleLock(postId: string, isLocked: boolean) {
    if (!isSuperadmin || source !== "supabase" || !supabase) return;

    try {
      const { error } = await supabase
        .from("community_posts")
        .update({ is_locked: !isLocked })
        .eq("id", postId);

      if (error) throw error;

      setPosts(
        posts.map((p) => (p.id === postId ? { ...p, is_locked: !isLocked } : p))
      );
    } catch (err) {
      console.error("Gagal mengubah status lock:", err);
    }
  }

  async function handleDeletePost(postId: string) {
    if (source !== "supabase" || !supabase) return;
    
    if (!confirm("Apakah Anda yakin ingin menghapus diskusi ini beserta semua komentarnya?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      setPosts(posts.filter((p) => p.id !== postId));
      if (selectedPostId === postId) {
        setSelectedPostId(null);
      }
      setStatusMessage({ text: "Postingan berhasil dihapus.", type: "success" });
    } catch (err) {
      console.error("Gagal menghapus postingan:", err);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (source !== "supabase" || !supabase) return;

    if (!confirm("Hapus komentar ini?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("community_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      setComments(comments.filter((c) => c.id !== commentId));
      
      // Update comment count locally
      if (selectedPostId) {
        setPosts(
          posts.map((p) =>
            p.id === selectedPostId ? { ...p, comments_count: Math.max(0, p.comments_count - 1) } : p
          )
        );
      }
    } catch (err) {
      console.error("Gagal menghapus komentar:", err);
    }
  }

  // Filter posts
  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Semua" || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Pinned posts always stay on top
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;

      if (sortBy === "upvote") {
        return b.likes_count - a.likes_count;
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const activePost = posts.find((p) => p.id === selectedPostId);

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div className={`rounded-2xl border p-4 flex items-start gap-3 ${
          statusMessage.type === "success" 
            ? "border-emerald-100 bg-emerald-50 text-emerald-800 dark:border-emerald-500/10 dark:bg-emerald-500/10 dark:text-emerald-400" 
            : "border-red-100 bg-red-50 text-red-800 dark:border-red-500/10 dark:bg-red-500/10 dark:text-red-400"
        }`}>
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <p className="text-sm font-semibold">{statusMessage.text}</p>
        </div>
      )}

      {selectedPostId && activePost ? (
        /* DETAIL VIEW THREAD */
        <FadeIn className="space-y-6">
          <button 
            onClick={() => setSelectedPostId(null)}
            className="secondary-button inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Diskusi
          </button>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Thread Utama & Komentar */}
            <div className="space-y-6">
              {/* Post Utama */}
              <div className="rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-lg)] md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(83,88,98,0.08)] dark:border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)] font-bold text-base uppercase">
                      {activePost.profiles?.full_name?.charAt(0) || "U"}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--color-obsidian)]">
                          {activePost.profiles?.full_name || "Member"}
                        </span>
                        {activePost.profiles?.role === "superadmin" ? (
                          <span className="rounded-full bg-purple-100 text-purple-700 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider dark:bg-purple-900/30 dark:text-purple-400">
                            ⭐ Admin
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider dark:bg-emerald-950/30 dark:text-emerald-400">
                            Premium Member
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-[var(--color-ash-gray)]">
                        {new Date(activePost.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      CATEGORIES.find(c => c.value === activePost.category)?.color || "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                      {CATEGORIES.find(c => c.value === activePost.category)?.label || activePost.category}
                    </span>
                    {activePost.is_pinned && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" title="Pinned Post">
                        <Pin className="h-3.5 w-3.5 fill-current" />
                      </span>
                    )}
                    {activePost.is_locked && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" title="Locked Discussion">
                        <Lock className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h1 className="font-aeonik text-2xl font-bold tracking-tight text-[var(--color-obsidian)] sm:text-3xl">
                    {activePost.title}
                  </h1>
                  <p className="mt-6 text-sm font-medium leading-relaxed text-[var(--color-silver-pine)] whitespace-pre-wrap">
                    {activePost.content}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-[rgba(83,88,98,0.08)] dark:border-white/5 pt-4">
                  <button 
                    onClick={() => handleToggleLike(activePost.id, activePost.has_liked)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all border ${
                      activePost.has_liked
                        ? "bg-[var(--color-midnight-ink)] text-white border-transparent"
                        : "bg-[var(--color-arctic-mist)] text-[var(--color-silver-pine)] border-transparent hover:bg-gray-200"
                    }`}
                  >
                    <ThumbsUp className={`h-4.5 w-4.5 ${activePost.has_liked ? "fill-white" : ""}`} />
                    <span>Upvote ({activePost.likes_count})</span>
                  </button>

                  {/* Superadmin Moderation Panel */}
                  {isSuperadmin && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleTogglePin(activePost.id, activePost.is_pinned)}
                        className={`icon-button ${activePost.is_pinned ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40" : ""}`}
                        title={activePost.is_pinned ? "Lepas Pin" : "Sematkan Postingan"}
                      >
                        <Pin className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleLock(activePost.id, activePost.is_locked)}
                        className={`icon-button ${activePost.is_locked ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40" : ""}`}
                        title={activePost.is_locked ? "Buka Kunci Diskusi" : "Kunci Diskusi"}
                      >
                        {activePost.is_locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => handleDeletePost(activePost.id)}
                        className="icon-button hover:bg-red-50 hover:text-red-600"
                        title="Hapus Diskusi"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Komentar Title */}
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-silver-pine)] pl-2">
                <MessageSquare className="h-4 w-4" />
                Semua Balasan ({comments.length})
              </div>

              {/* List Komentar */}
              {loadingComments ? (
                <div className="flex h-32 items-center justify-center rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)]">
                  <span className="text-sm text-[var(--color-ash-gray)]">Memuat komentar...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[rgba(83,88,98,0.1)] bg-white/50 dark:bg-[var(--color-canvas-white)]/50 p-6 text-center">
                  <MessageCircle className="mb-3 h-8 w-8 text-[var(--color-ash-gray)] opacity-40" />
                  <h3 className="font-aeonik text-base font-semibold text-[var(--color-obsidian)]">Belum ada tanggapan</h3>
                  <p className="mt-1 text-xs text-[var(--color-silver-pine)]">Jadilah orang pertama yang menanggapi diskusi ini!</p>
                </div>
              ) : (
                <Stagger className="flex flex-col gap-3">
                  {comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className="rounded-[24px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-5 shadow-[var(--shadow-subtle)] border border-[rgba(83,88,98,0.04)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 font-bold text-xs uppercase dark:bg-gray-800 dark:text-gray-300">
                            {comment.profiles?.full_name?.charAt(0) || "U"}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-[var(--color-obsidian)]">
                                {comment.profiles?.full_name || "Member"}
                              </span>
                              {comment.profiles?.role === "superadmin" ? (
                                <span className="rounded-full bg-purple-50 text-purple-700 px-2 py-0.2 text-[9px] font-black uppercase dark:bg-purple-950/20 dark:text-purple-400">
                                  ⭐ Admin
                                </span>
                              ) : (
                                <span className="rounded-full bg-emerald-50 text-emerald-800 px-2 py-0.2 text-[9px] font-black uppercase dark:bg-emerald-950/20 dark:text-emerald-400">
                                  Member
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] font-semibold text-[var(--color-ash-gray)]">
                              {new Date(comment.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>

                        {/* Hapus komentar (oleh pemilik komentar atau admin) */}
                        {(isSuperadmin || (currentUser && comment.user_id === currentUser.id)) && (
                          <button 
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-[var(--color-ash-gray)] hover:text-red-600 transition-colors p-1"
                            title="Hapus Komentar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="mt-3.5 pl-11 text-sm font-medium leading-relaxed text-[var(--color-silver-pine)] whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </Stagger>
              )}

              {/* Form Tambah Komentar */}
              {activePost.is_locked && !isSuperadmin ? (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 flex items-center gap-3 dark:bg-amber-950/10 dark:border-amber-900/20">
                  <Lock className="h-5 w-5 text-amber-600 shrink-0" />
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                    Diskusi ini dikunci oleh admin. Komentar dinonaktifkan.
                  </p>
                </div>
              ) : (
                <div className="rounded-[28px] bg-white dark:bg-[var(--color-canvas-white)] p-6 shadow-[var(--shadow-subtle)] border border-[rgba(83,88,98,0.06)]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ash-gray)] mb-3">Tulis Tanggapan Anda</h4>
                  <form onSubmit={handleCreateComment} className="flex gap-3 items-end">
                    <textarea 
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder={activePost.is_locked ? "Sebagai Admin, Anda bisa membalas utas terkunci..." : "Bagikan opini atau tanggapan Anda di sini..."}
                      className="form-input bg-[var(--color-arctic-mist)] text-sm min-h-[80px] py-3 resize-none flex-1"
                      required
                    />
                    <button 
                      type="submit" 
                      className="primary-button h-11 px-5 shrink-0"
                      disabled={submittingComment}
                    >
                      <Send className="h-4 w-4" />
                      <span className="hidden sm:inline">Kirim</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar Kanan Detail (Rules & Info) */}
            <div className="space-y-4">
              <div className="rounded-3xl bg-[var(--color-arctic-mist)] p-6 dark:bg-[var(--color-canvas-white)]/40 dark:border dark:border-white/5">
                <Users className="h-8 w-8 text-[var(--color-electric-blue)] mb-4" />
                <h4 className="font-aeonik text-lg font-bold text-[var(--color-obsidian)]">Panduan Komunitas</h4>
                <p className="mt-3 text-xs font-medium leading-relaxed text-[var(--color-silver-pine)]">
                  Komunitas ini dibentuk untuk saling membantu mengoptimalkan penggunaan AI di pekerjaan masing-masing.
                </p>
                <ul className="mt-4 space-y-2 text-xs font-semibold text-[var(--color-silver-pine)]">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--color-electric-blue)] mt-0.5">•</span>
                    Sopan & saling menghormati pendapat sesama member.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--color-electric-blue)] mt-0.5">•</span>
                    Dilarang membagikan link spam / promosi produk luar tanpa izin admin.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--color-electric-blue)] mt-0.5">•</span>
                    Admin berhak menyematkan (pin), mengunci (lock) atau menghapus postingan jika diperlukan.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </FadeIn>
      ) : showCreateForm ? (
        /* FORM CREATE POST */
        <FadeIn className="max-w-3xl mx-auto">
          <div className="rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-lg)] md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-aeonik text-2xl font-bold tracking-tight text-[var(--color-obsidian)]">
                Buat Diskusi Baru 💬
              </h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="secondary-button py-2 px-4 text-xs"
              >
                Batal
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-ash-gray)]" htmlFor="post-title">
                  Judul Diskusi
                </label>
                <input
                  id="post-title"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="form-input bg-[var(--color-arctic-mist)] text-sm py-3"
                  placeholder="Contoh: Bagaimana cara Anda menyusun context window di Claude?"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-ash-gray)]" htmlFor="post-category">
                  Kategori Diskusi
                </label>
                <select
                  id="post-category"
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="form-input bg-[var(--color-arctic-mist)] text-sm py-3 cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-ash-gray)]" htmlFor="post-content">
                  Isi Postingan / Pertanyaan
                </label>
                <textarea
                  id="post-content"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="admin-textarea bg-[var(--color-arctic-mist)] text-sm min-h-[180px] resize-y"
                  placeholder="Deskripsikan ide, pertanyaan, atau showcase yang ingin Anda bagikan. Anda juga bisa menyisipkan contoh output prompt atau hasil pengerjaan di sini..."
                  required
                />
              </div>

              <button 
                type="submit" 
                className="primary-button w-full justify-center py-4 text-base"
                disabled={submittingPost}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                {submittingPost ? "Mempublikasikan..." : "Publikasikan Sekarang"}
              </button>
            </form>
          </div>
        </FadeIn>
      ) : (
        /* MAIN LIST VIEW */
        <FadeIn className="space-y-6">
          {/* Header & Fitur Pencarian */}
          <div className="rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-lg)] md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="rounded-full bg-[var(--color-mint-glaze)] px-4 py-2 text-xs font-semibold text-[var(--color-silver-pine)]">
                  Community Discussion
                </span>
                <h2 className="mt-4 font-aeonik text-3xl font-bold tracking-tight text-[var(--color-obsidian)]">
                  Komunitas & Diskusi Member
                </h2>
                <p className="mt-2 text-sm font-medium text-[var(--color-silver-pine)] max-w-xl">
                  Tempat berbagi prompt terbaik, mendiskusikan workflow AI terbaru, memamerkan proyek, serta berdiskusi bersama member lain dan Admin.
                </p>
              </div>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="primary-button shrink-0 inline-flex items-center gap-2 self-start md:self-center"
              >
                <PlusCircle className="h-5 w-5" />
                Buat Diskusi Baru
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="mt-8 flex flex-col gap-4 border-t border-[rgba(83,88,98,0.08)] dark:border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
              {/* Category selector */}
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
                <button 
                  onClick={() => setSelectedCategory("Semua")}
                  className={`rounded-full px-4 py-2 text-xs font-bold border transition-all ${
                    selectedCategory === "Semua"
                      ? "bg-[var(--color-midnight-ink)] text-white border-transparent"
                      : "bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  Semua Kategori
                </button>
                {CATEGORIES.map((c) => (
                  <button 
                    key={c.value}
                    onClick={() => setSelectedCategory(c.value)}
                    className={`rounded-full px-4 py-2 text-xs font-bold border transition-all whitespace-nowrap ${
                      selectedCategory === c.value
                        ? "bg-[var(--color-midnight-ink)] text-white border-transparent"
                        : "bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Search & Sort */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 sm:w-64 min-w-[200px]">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ash-gray)]" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari topik diskusi..."
                    className="form-input bg-[var(--color-arctic-mist)] pl-10 pr-4 py-2.5 text-xs w-full"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="form-input bg-[var(--color-arctic-mist)] text-xs py-2.5 px-3 w-fit cursor-pointer"
                >
                  <option value="terbaru">Terbaru</option>
                  <option value="upvote">Terpopuler (Upvote)</option>
                </select>
              </div>
            </div>
          </div>

          {/* List Postings */}
          {loadingPosts ? (
            <div className="flex h-64 items-center justify-center rounded-[32px] border border-[rgba(83,88,98,0.06)] bg-white/50 dark:bg-[var(--color-canvas-white)]/50">
              <span className="text-sm font-semibold text-[var(--color-ash-gray)]">Memuat daftar diskusi...</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[rgba(83,88,98,0.1)] bg-white/50 dark:bg-[var(--color-canvas-white)]/50 p-6 text-center">
              <MessageSquare className="mb-4 h-10 w-10 text-[var(--color-ash-gray)] opacity-40" />
              <h3 className="font-aeonik text-lg text-[var(--color-obsidian)]">Tidak Ada Diskusi Ditemukan</h3>
              <p className="mt-2 text-xs text-[var(--color-silver-pine)]">Silakan buat diskusi baru untuk memulai interaksi di sini.</p>
            </div>
          ) : (
            <Stagger className="flex flex-col gap-4">
              {filteredPosts.map((post) => (
                <LiftCard 
                  key={post.id} 
                  className={`rounded-3xl bg-white dark:bg-[var(--color-canvas-white)] p-6 shadow-[var(--shadow-subtle)] border transition-all cursor-pointer ${
                    post.is_pinned 
                      ? "border-blue-200 dark:border-blue-900/30" 
                      : "border-[rgba(83,88,98,0.06)] dark:border-white/10"
                  }`}
                  onClick={() => setSelectedPostId(post.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                          CATEGORIES.find(c => c.value === post.category)?.color || "bg-gray-100 text-gray-700"
                        }`}>
                          {CATEGORIES.find(c => c.value === post.category)?.label || post.category}
                        </span>
                        
                        {post.is_pinned && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-wider dark:text-blue-400">
                            <Pin className="h-3 w-3 fill-current" />
                            Pinned
                          </span>
                        )}
                        {post.is_locked && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 uppercase tracking-wider dark:text-amber-400">
                            <Lock className="h-3 w-3" />
                            Locked
                          </span>
                        )}

                        <span className="text-[10px] text-[var(--color-ash-gray)] font-semibold">
                          Oleh {post.profiles?.full_name || "Member"}
                        </span>
                        {post.profiles?.role === "superadmin" && (
                          <span className="rounded-full bg-purple-100 text-purple-700 px-2 py-0.2 text-[8px] font-black uppercase tracking-wider dark:bg-purple-950/20 dark:text-purple-400">
                            ⭐ Admin
                          </span>
                        )}
                      </div>

                      <h3 className="font-aeonik text-lg font-bold text-[var(--color-obsidian)] group-hover:text-[var(--color-electric-blue)]">
                        {post.title}
                      </h3>
                      
                      <p className="text-xs font-semibold text-[var(--color-silver-pine)] line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Like & Comment indicators */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Avoid opening thread when upvote is clicked
                          handleToggleLike(post.id, post.has_liked);
                        }}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all border ${
                          post.has_liked
                            ? "bg-[var(--color-midnight-ink)] text-white border-transparent"
                            : "bg-[var(--color-arctic-mist)] text-[var(--color-silver-pine)] border-transparent hover:bg-gray-200"
                        }`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        {post.likes_count}
                      </button>
                      <span className="flex items-center gap-1.5 rounded-full bg-[var(--color-arctic-mist)] text-[var(--color-silver-pine)] px-3 py-1.5 text-[10px] font-bold border-transparent">
                        <MessageSquare className="h-3 w-3" />
                        {post.comments_count}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[rgba(83,88,98,0.04)] dark:border-white/5 pt-3 text-[10px] font-bold text-[var(--color-ash-gray)]">
                    <span>
                      {new Date(post.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="text-[var(--color-electric-blue)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Buka Diskusi <CornerDownRight className="h-3 w-3" />
                    </span>
                  </div>
                </LiftCard>
              ))}
            </Stagger>
          )}
        </FadeIn>
      )}
    </div>
  );
}

// Fallback Data Generator
function getFallbackPosts(): Post[] {
  return [
    {
      id: "fallback-post-1",
      title: "Bagaimana cara Anda menyusun System Prompt untuk coding agent?",
      content: "Saya sedang membuat CLI coding assistant mandiri menggunakan Gemini Flash. Apakah ada best practice untuk menyusun system prompt agar agent bisa menulis kode bersih secara konsisten dan tidak terlalu banyak memotong kodenya? Terima kasih!",
      category: "Tanya Jawab",
      is_pinned: true,
      is_locked: false,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      user_id: "mock-id-1",
      profiles: { email: "member1@example.com", full_name: "Yusuf K.", role: "access" },
      community_comments: [{ id: "c1" }, { id: "c2" }],
      community_post_likes: [{ user_id: "user1" }, { user_id: "user2" }],
      likes_count: 2,
      comments_count: 2,
      has_liked: false
    },
    {
      id: "fallback-post-2",
      title: "Showcase: Prompt Generator Copywriting Iklan FB dengan Hook Emosional",
      content: "Halo kawan-kawan! Saya baru saja merilis generator prompt di AI Studio untuk kebutuhan copywriter periklanan Facebook. Outputnya otomatis memiliki format 3 variasi hook emosional, 1 body text persuasif, dan 1 CTA langsung. Silakan coba promptnya dan berikan feedback ya!",
      category: "Showcase",
      is_pinned: false,
      is_locked: false,
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      user_id: "mock-id-2",
      profiles: { email: "member2@example.com", full_name: "Mega Saputri", role: "access" },
      community_comments: [{ id: "c3" }],
      community_post_likes: [{ user_id: "user1" }, { user_id: "user2" }, { user_id: "user3" }],
      likes_count: 3,
      comments_count: 1,
      has_liked: true
    },
    {
      id: "fallback-post-3",
      title: "Tips: Cara Menggunakan Rule of Thumb 'Act as a...' untuk Output Stabil",
      content: "Seringkali AI meleset dari tone yang kita inginkan jika kita tidak membatasinya di awal. Menggunakan template Act as a [Role] di awal prompt library kita sangat membantu menstabilkan response AI, terutama untuk model reasoning seperti Claude 3 Opus/GPT-4o.",
      category: "Tips & Prompt",
      is_pinned: false,
      is_locked: false,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      user_id: "mock-admin",
      profiles: { email: "admin@promptvault.local", full_name: "Yogi Fani (Admin)", role: "superadmin" },
      community_comments: [],
      community_post_likes: [{ user_id: "user1" }],
      likes_count: 1,
      comments_count: 0,
      has_liked: false
    }
  ];
}

function getFallbackComments(postId: string): Comment[] {
  return [
    {
      id: "fallback-comment-1",
      post_id: postId,
      user_id: "mock-admin",
      content: "Halo Yusuf! Sangat disarankan untuk memberikan 'Few-shot examples' di dalam system prompt, khususnya contoh kode input dan output ideal yang Anda harapkan. Menginstruksikan AI untuk menulis seluruh blok kode (jangan menulis placeholder seperti '// keep original code here') juga sangat ampuh di Gemini.",
      created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      profiles: { email: "admin@promptvault.local", full_name: "Yogi Fani (Admin)", role: "superadmin" }
    },
    {
      id: "fallback-comment-2",
      post_id: postId,
      user_id: "mock-id-3",
      content: "Setuju dengan saran admin! Saya juga menambahkan rule: 'Do not omit any code snippets for brevity' di system prompt dan sejauh ini performanya meningkat drastis.",
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      profiles: { email: "member3@example.com", full_name: "Ahmad Rizky", role: "access" }
    }
  ];
}
