"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { PostCard } from "./post-card"
import { CreatePostModal } from "./create-post-modal"
import { Button } from "@/components/ui/button"
import { Plus, LogOut, User, MessageSquare, Bell, Compass } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Post {
  id: string
  user_id: string
  content: string
  media_url: string | null
  media_type: string | null
  mood: string | null
  created_at: string
  expires_at: string
  profiles: {
    username: string
    avatar_url: string | null
  }
  likes: Array<{ count: number }>
}

export function FeedClient({
  initialPosts,
  userId,
}: {
  initialPosts: Post[]
  userId: string
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to new posts
    const channel = supabase
      .channel("posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        setPosts((prev) => [payload.new as Post, ...prev])
      })
      .subscribe()

    // Fetch unread notifications count
    const fetchUnreadCount = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .is("read_at", null)

      setUnreadCount(data?.length || 0)
    }

    fetchUnreadCount()

    // Subscribe to new notifications
    const notificationChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => {
          fetchUnreadCount()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
      notificationChannel.unsubscribe()
    }
  }, [supabase, userId])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Loopz</h1>
          <div className="flex gap-2">
            <Link href="/explore">
              <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                <Compass className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/messages">
              <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/notifications">
              <Button size="sm" variant="outline" className="gap-2 bg-transparent relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/profile">
              <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                <User className="w-4 h-4" />
              </Button>
            </Link>
            <Button onClick={() => setIsCreateOpen(true)} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Post
            </Button>
            <Button onClick={handleLogout} size="sm" variant="outline" className="gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Feed */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} currentUserId={userId} />)
          )}
        </div>
      </main>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        userId={userId}
        onPostCreated={(newPost) => {
          setPosts((prev) => [newPost, ...prev])
          setIsCreateOpen(false)
        }}
      />
    </div>
  )
}
