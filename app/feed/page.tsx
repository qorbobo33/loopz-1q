import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FeedClient } from "@/components/feed/feed-client"

export default async function FeedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch posts and join with profiles using the user_id relationship
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_user_id_fkey_profiles(username, avatar_url), likes(count)")
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("[v0] Feed fetch error:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <FeedClient initialPosts={posts || []} userId={user.id} />
    </div>
  )
}
