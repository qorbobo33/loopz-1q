import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileClient } from "@/components/profile/profile-client"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    redirect("/auth/login")
  }

  // Fetch profile data
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

  if (!profile) {
    redirect("/feed")
  }

  // Fetch user's posts with profile data
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_url), likes(count)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })

  // Fetch user's memories
  const { data: memories } = await supabase
    .from("memories")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <ProfileClient
        profile={profile}
        posts={posts || []}
        memories={memories || []}
        currentUserId={currentUser.id}
        isOwnProfile={profile.id === currentUser.id}
      />
    </div>
  )
}
