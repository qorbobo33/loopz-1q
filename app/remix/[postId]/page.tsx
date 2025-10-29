import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RemixClient } from "@/components/remix/remix-client"

export default async function RemixPage({
  params,
}: {
  params: Promise<{ postId: string }>
}) {
  const { postId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch original post
  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_url)")
    .eq("id", postId)
    .single()

  if (!post) {
    redirect("/feed")
  }

  // Fetch remixes of this post
  const { data: remixes } = await supabase
    .from("remixes")
    .select("*, profiles!remixes_user_id_fkey(username, avatar_url)")
    .eq("original_post_id", postId)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <RemixClient originalPost={post} remixes={remixes || []} userId={user.id} />
    </div>
  )
}
