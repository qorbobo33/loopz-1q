import { createClient } from "@/lib/supabase/server"
import { UserProfileClient } from "@/components/profile/user-profile-client"

export default async function UserProfilePage({
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
    return <div>Not authenticated</div>
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

  if (!profile) {
    return <div>User not found</div>
  }

  // Fetch user posts
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_url), likes(count)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })

  // Fetch user memories
  const { data: memories } = await supabase
    .from("memories")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })

  // Fetch follower/following counts
  const { data: followers } = await supabase
    .from("followers")
    .select("id", { count: "exact" })
    .eq("following_id", profile.id)

  const { data: following } = await supabase
    .from("followers")
    .select("id", { count: "exact" })
    .eq("follower_id", profile.id)

  // Check if current user follows this user
  const { data: isFollowing } = await supabase
    .from("followers")
    .select("id")
    .eq("follower_id", currentUser.id)
    .eq("following_id", profile.id)
    .single()

  return (
    <UserProfileClient
      profile={profile}
      posts={posts || []}
      memories={memories || []}
      currentUserId={currentUser.id}
      isOwnProfile={profile.id === currentUser.id}
      followerCount={followers?.length || 0}
      followingCount={following?.length || 0}
      isFollowing={!!isFollowing}
    />
  )
}
