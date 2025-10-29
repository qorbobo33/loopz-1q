import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function MyProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch current user's profile
  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single()

  if (!profile) {
    redirect("/feed")
  }

  redirect(`/profile/${profile.username}`)
}
