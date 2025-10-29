import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MessagesClient } from "@/components/messages/messages-client"

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch conversations
  const { data: conversations } = await supabase
    .from("messages")
    .select("sender_id, recipient_id, profiles!messages_sender_id_fkey(username, avatar_url)")
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  // Get unique conversation partners
  const uniqueConversations = new Map()
  conversations?.forEach((msg: any) => {
    const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
    if (!uniqueConversations.has(partnerId)) {
      uniqueConversations.set(partnerId, msg)
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <MessagesClient userId={user.id} initialConversations={Array.from(uniqueConversations.values())} />
    </div>
  )
}
