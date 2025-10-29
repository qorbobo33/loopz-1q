"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PostCard } from "@/components/feed/post-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
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

export function ExploreClient({ userId, initialPosts }: { userId: string; initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  const moods = ["happy", "sad", "excited", "calm", "neutral", "creative"]

  const filteredPosts = posts.filter((post) => {
    const matchesMood = !selectedMood || post.mood === selectedMood
    const matchesSearch =
      !searchQuery ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.profiles.username.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesMood && matchesSearch
  })

  const trendingPosts = [...filteredPosts].sort((a, b) => {
    const aLikes = a.likes[0]?.count || 0
    const bLikes = b.likes[0]?.count || 0
    return bLikes - aLikes
  })

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-primary">Explore</h1>
            <Link href="/feed">
              <Button variant="outline" size="sm">
                Back to Feed
              </Button>
            </Link>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Filter by Mood</h2>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedMood === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMood(null)}
            >
              All Moods
            </Button>
            {moods.map((mood) => (
              <Button
                key={mood}
                variant={selectedMood === mood ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMood(mood)}
                className="capitalize"
              >
                {mood}
              </Button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="space-y-4">
          {trendingPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts found. Try adjusting your filters.</p>
            </div>
          ) : (
            trendingPosts.map((post) => <PostCard key={post.id} post={post} currentUserId={userId} />)
          )}
        </div>
      </main>
    </div>
  )
}
