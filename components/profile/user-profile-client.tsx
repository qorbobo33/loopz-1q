"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Grid3x3, Sparkles, UserPlus, UserCheck } from "lucide-react"
import Link from "next/link"
import { PostCard } from "../feed/post-card"
import { MemoryViewer } from "./memory-viewer"

interface Profile {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  mood: string
  created_at: string
}

interface Memory {
  id: string
  post_id: string
  animation_data: any
  created_at: string
}

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

interface UserProfileClientProps {
  profile: Profile
  posts: Post[]
  memories: Memory[]
  currentUserId: string
  isOwnProfile: boolean
  followerCount: number
  followingCount: number
  isFollowing: boolean
}

export function UserProfileClient({
  profile,
  posts,
  memories,
  currentUserId,
  isOwnProfile,
  followerCount,
  followingCount,
  isFollowing: initialIsFollowing,
}: UserProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "memories">("posts")
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followers, setFollowers] = useState(followerCount)
  const supabase = createClient()

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await supabase.from("followers").delete().eq("follower_id", currentUserId).eq("following_id", profile.id)
        setFollowers((prev) => Math.max(0, prev - 1))
      } else {
        await supabase.from("followers").insert({
          follower_id: currentUserId,
          following_id: profile.id,
        })
        setFollowers((prev) => prev + 1)

        // Create notification
        await supabase.from("notifications").insert({
          user_id: profile.id,
          type: "follow",
          related_user_id: currentUserId,
        })
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error("Error toggling follow:", error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/feed">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{profile.display_name}</h1>
        </div>
      </header>

      {/* Profile Section */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card className="backdrop-blur-sm bg-card/80 border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden border-4 border-primary/20">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url || "/placeholder.svg"}
                        alt={profile.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-primary-foreground">
                        {profile.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{profile.display_name}</h2>
                    <p className="text-muted-foreground">@{profile.username}</p>
                  </div>

                  {profile.bio && <p className="text-sm">{profile.bio}</p>}

                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="font-semibold">{posts.length}</span>
                      <span className="text-muted-foreground ml-1">Posts</span>
                    </div>
                    <div>
                      <span className="font-semibold">{followers}</span>
                      <span className="text-muted-foreground ml-1">Followers</span>
                    </div>
                    <div>
                      <span className="font-semibold">{followingCount}</span>
                      <span className="text-muted-foreground ml-1">Following</span>
                    </div>
                    <div>
                      <span className="font-semibold">{memories.length}</span>
                      <span className="text-muted-foreground ml-1">Memories</span>
                    </div>
                  </div>

                  {profile.mood && (
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Feeling {profile.mood}
                    </div>
                  )}

                  {!isOwnProfile && (
                    <Button
                      onClick={handleFollowToggle}
                      size="sm"
                      className="gap-2 w-full sm:w-auto"
                      variant={isFollowing ? "outline" : "default"}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab("posts")}
              className={`pb-3 px-2 font-medium text-sm transition-colors ${
                activeTab === "posts"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3x3 className="w-4 h-4 inline mr-2" />
              Posts
            </button>
            <button
              onClick={() => setActiveTab("memories")}
              className={`pb-3 px-2 font-medium text-sm transition-colors ${
                activeTab === "memories"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Memories
            </button>
          </div>

          {/* Content */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No posts yet</p>
                </div>
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} currentUserId={currentUserId} />)
              )}
            </div>
          )}

          {activeTab === "memories" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {memories.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">
                    No memories yet. Create one by clicking the memory button on a post!
                  </p>
                </div>
              ) : (
                memories.map((memory) => <MemoryViewer key={memory.id} memory={memory} />)
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
