"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { PostCard } from "./post-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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

interface MoodFeedClientProps {
  initialPosts: Post[]
  userId: string
  userMood: string
}

export function MoodFeedClient({ initialPosts, userId, userMood }: MoodFeedClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to new posts with matching mood
    const channel = supabase
      .channel("mood-posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
          filter: `mood=eq.${userMood}`,
        },
        (payload) => {
          setPosts((prev) => [payload.new as Post, ...prev])
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, userMood])

  const moodEmojis: Record<string, string> = {
    happy: "😊",
    sad: "😢",
    excited: "🤩",
    calm: "😌",
    neutral: "😐",
    creative: "🎨",
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/feed">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">
              {moodEmojis[userMood]} {userMood.charAt(0).toUpperCase() + userMood.slice(1)} Vibes
            </h1>
            <p className="text-xs text-muted-foreground">Posts from people feeling {userMood}</p>
          </div>
        </div>
      </header>

      {/* Mood Feed */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts from people feeling {userMood} yet</p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} currentUserId={userId} />)
          )}
        </div>
      </main>
    </div>
  )
}
