import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminClient } from "@/components/admin/admin-client"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: adminUser } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

  if (!adminUser) {
    redirect("/feed")
  }

  // Fetch dashboard stats
  const { data: allUsers } = await supabase.from("profiles").select("id", { count: "exact" })

  const { data: allPosts } = await supabase.from("posts").select("id", { count: "exact" })

  const { data: allMessages } = await supabase.from("messages").select("id", { count: "exact" })

  const { data: recentPosts } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-background">
      <AdminClient
        adminRole={adminUser.role}
        stats={{
          totalUsers: allUsers?.length || 0,
          totalPosts: allPosts?.length || 0,
          totalMessages: allMessages?.length || 0,
        }}
        recentPosts={recentPosts || []}
      />
    </div>
  )
}
