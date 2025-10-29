import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NotificationsClient } from "@/components/notifications/notifications-client"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*, profiles!notifications_related_user_id_fkey_profiles(username, avatar_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <NotificationsClient userId={user.id} initialNotifications={notifications || []} />
    </div>
  )
}
