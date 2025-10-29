"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

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
}

interface Remix {
  id: string
  user_id: string
  content: string
  media_url: string | null
  created_at: string
  expires_at: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

interface RemixClientProps {
  originalPost: Post
  remixes: Remix[]
  userId: string
}

export function RemixClient({ originalPost, remixes, userId }: RemixClientProps) {
  const [remixContent, setRemixContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [allRemixes, setAllRemixes] = useState(remixes)
  const supabase = createClient()

  const handleCreateRemix = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!remixContent.trim()) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("remixes")
        .insert({
          original_post_id: originalPost.id,
          user_id: userId,
          content: remixContent,
        })
        .select("*, profiles!remixes_user_id_fkey(username, avatar_url)")
        .single()

      if (error) throw error

      setAllRemixes((prev) => [data, ...prev])
      setRemixContent("")

      // Create notification for original post author
      await supabase.from("notifications").insert({
        user_id: originalPost.user_id,
        type: "remix",
        related_user_id: userId,
        related_post_id: originalPost.id,
      })
    } catch (error) {
      console.error("Error creating remix:", error)
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-xl font-bold">Remix This Loop</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="space-y-8">
          {/* Original Post */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  {originalPost.profiles.avatar_url ? (
                    <img
                      src={originalPost.profiles.avatar_url || "/placeholder.svg"}
                      alt={originalPost.profiles.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-primary">
                      {originalPost.profiles.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{originalPost.profiles.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(originalPost.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {originalPost.content && <p className="text-sm">{originalPost.content}</p>}
              {originalPost.media_url && originalPost.media_type === "image" && (
                <img
                  src={originalPost.media_url || "/placeholder.svg"}
                  alt="Post media"
                  className="w-full rounded-lg object-cover max-h-96"
                />
              )}
              {originalPost.mood && (
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {originalPost.mood}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Remix Form */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Your Remix</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRemix} className="space-y-4">
                <Textarea
                  placeholder="Add your own spin to this loop..."
                  value={remixContent}
                  onChange={(e) => setRemixContent(e.target.value)}
                  className="min-h-24 resize-none"
                />
                <Button type="submit" className="w-full gap-2" disabled={isLoading || !remixContent.trim()}>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Post Remix
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Remixes List */}
          <div className="space-y-4">
            <h3 className="font-semibold">Remixes ({allRemixes.length})</h3>
            {allRemixes.length === 0 ? (
              <p className="text-muted-foreground text-sm">No remixes yet. Be the first!</p>
            ) : (
              allRemixes.map((remix) => (
                <Card key={remix.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        {remix.profiles.avatar_url ? (
                          <img
                            src={remix.profiles.avatar_url || "/placeholder.svg"}
                            alt={remix.profiles.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-primary">
                            {remix.profiles.username[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{remix.profiles.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(remix.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{remix.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
