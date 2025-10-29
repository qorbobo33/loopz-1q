import { createClient } from "@/lib/supabase/server"
import { ExploreClient } from "@/components/explore/explore-client"

export default async function ExplorePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  // Fetch trending posts
  const { data: trendingPosts } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_url), likes(count)")
    .order("created_at", { ascending: false })
    .limit(50)

  return <ExploreClient userId={user.id} initialPosts={trendingPosts || []} />
}
