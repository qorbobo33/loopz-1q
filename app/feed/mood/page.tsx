import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MoodFeedClient } from "@/components/feed/mood-feed-client"

export default async function MoodFeedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's mood
  const { data: profile } = await supabase.from("profiles").select("mood").eq("id", user.id).single()

  // Fetch posts matching user's mood (mood-based algorithm)
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_url), likes(count)")
    .eq("mood", profile?.mood || "neutral")
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-background">
      <MoodFeedClient initialPosts={posts || []} userId={user.id} userMood={profile?.mood || "neutral"} />
    </div>
  )
}
