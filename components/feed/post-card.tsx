"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, Trash2, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface PostCardProps {
  post: {
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
  currentUserId: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes[0]?.count || 0)
  const [isCreatingMemory, setIsCreatingMemory] = useState(false)
  const supabase = createClient()

  const handleLike = async () => {
    if (isLiked) {
      await supabase.from("likes").delete().eq("post_id", post.id)
      setLikeCount((prev) => Math.max(0, prev - 1))
    } else {
      await supabase.from("likes").insert({
        post_id: post.id,
        user_id: currentUserId,
      })
      setLikeCount((prev) => prev + 1)

      // Create notification
      if (post.user_id !== currentUserId) {
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          type: "like",
          related_user_id: currentUserId,
          related_post_id: post.id,
        })
      }
    }
    setIsLiked(!isLiked)
  }

  const handleDelete = async () => {
    if (post.user_id === currentUserId) {
      await supabase.from("posts").delete().eq("id", post.id)
    }
  }

  const handleCreateMemory = async () => {
    setIsCreatingMemory(true)
    try {
      // Generate AI animation data based on post content and mood
      const animationData = generateMemoryAnimation(post.content, post.mood)

      await supabase.from("memories").insert({
        post_id: post.id,
        user_id: currentUserId,
        animation_data: animationData,
      })

      // Show success feedback
      alert("Memory created! Check your profile to view it.")
    } catch (error) {
      console.error("Error creating memory:", error)
    } finally {
      setIsCreatingMemory(false)
    }
  }

  const expiresIn = formatDistanceToNow(new Date(post.expires_at), {
    addSuffix: true,
  })

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow backdrop-blur-sm bg-card/80 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/user/${post.profiles.username}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
                {post.profiles.avatar_url ? (
                  <img
                    src={post.profiles.avatar_url || "/placeholder.svg"}
                    alt={post.profiles.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-primary-foreground">
                    {post.profiles.username[0].toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
            <div>
              <Link href={`/user/${post.profiles.username}`}>
                <p className="font-semibold text-sm hover:text-primary transition-colors cursor-pointer">
                  {post.profiles.username}
                </p>
              </Link>
              <p className="text-xs text-muted-foreground">{expiresIn}</p>
            </div>
          </div>
          {post.user_id === currentUserId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {post.content && <p className="text-sm leading-relaxed">{post.content}</p>}

        {post.media_url && post.media_type === "image" && (
          <img
            src={post.media_url || "/placeholder.svg"}
            alt="Post media"
            className="w-full rounded-lg object-cover max-h-96"
          />
        )}
        {post.media_url && post.media_type === "video" && (
          <video src={post.media_url} controls className="w-full rounded-lg max-h-96" />
        )}
        {post.media_url && post.media_type === "audio" && <audio src={post.media_url} controls className="w-full" />}

        {post.mood && (
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {post.mood}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`gap-2 ${isLiked ? "text-destructive" : ""}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            {likeCount}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreateMemory}
            disabled={isCreatingMemory}
            className="gap-2 text-accent hover:text-accent"
          >
            <Sparkles className="w-4 h-4" />
            {isCreatingMemory ? "Creating..." : "Memory"}
          </Button>
          <Link href={`/remix/${post.id}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function generateMemoryAnimation(content: string, mood: string | null) {
  const moodColors: Record<string, string> = {
    happy: "#FFD700",
    sad: "#4169E1",
    excited: "#FF6347",
    calm: "#98FB98",
    neutral: "#D3D3D3",
    creative: "#9B5DE5",
  }

  const color = moodColors[mood || "neutral"] || "#9B5DE5"

  // Generate animation keyframes based on content length and mood
  const contentLength = content.length
  const duration = Math.min(Math.max(contentLength / 10, 2), 8)

  return {
    type: "particle-burst",
    color,
    duration,
    particles: Math.min(contentLength / 5, 50),
    intensity: mood === "excited" ? "high" : mood === "calm" ? "low" : "medium",
    pattern: mood === "happy" ? "spiral" : mood === "sad" ? "fall" : "burst",
    keyframes: [
      { time: 0, scale: 0, opacity: 1 },
      { time: 0.5, scale: 1, opacity: 1 },
      { time: 1, scale: 0.5, opacity: 0 },
    ],
  }
}
