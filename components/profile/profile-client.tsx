"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Edit2, Grid3x3, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EditProfileModal } from "./edit-profile-modal"
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

interface ProfileClientProps {
  profile: Profile
  posts: Post[]
  memories: Memory[]
  currentUserId: string
  isOwnProfile: boolean
}

export function ProfileClient({ profile, posts, memories, currentUserId, isOwnProfile }: ProfileClientProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"posts" | "memories">("posts")
  const [profileData, setProfileData] = useState(profile)
  const router = useRouter()

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfileData(updatedProfile)
    setIsEditOpen(false)
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
          <h1 className="text-xl font-bold">{profileData.display_name}</h1>
        </div>
      </header>

      {/* Profile Section */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden border-4 border-primary/20">
                    {profileData.avatar_url ? (
                      <img
                        src={profileData.avatar_url || "/placeholder.svg"}
                        alt={profileData.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-primary-foreground">
                        {profileData.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{profileData.display_name}</h2>
                    <p className="text-muted-foreground">@{profileData.username}</p>
                  </div>

                  {profileData.bio && <p className="text-sm">{profileData.bio}</p>}

                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="font-semibold">{posts.length}</span>
                      <span className="text-muted-foreground ml-1">Posts</span>
                    </div>
                    <div>
                      <span className="font-semibold">{memories.length}</span>
                      <span className="text-muted-foreground ml-1">Memories</span>
                    </div>
                  </div>

                  {profileData.mood && (
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Feeling {profileData.mood}
                    </div>
                  )}

                  {isOwnProfile && (
                    <Button onClick={() => setIsEditOpen(true)} size="sm" className="gap-2 w-full sm:w-auto">
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        profile={profileData}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  )
}
