"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  read_at: string | null
}

interface Conversation {
  sender_id: string
  recipient_id: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

interface MessagesClientProps {
  userId: string
  initialConversations: Conversation[]
}

export function MessagesClient({ userId, initialConversations }: MessagesClientProps) {
  const [conversations, setConversations] = useState(initialConversations)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const selectedPartner = selectedConversation
    ? conversations.find((c) => c.sender_id === selectedConversation || c.recipient_id === selectedConversation)
    : null

  useEffect(() => {
    if (!selectedConversation) return

    // Fetch messages for selected conversation
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${userId},recipient_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},recipient_id.eq.${userId})`,
        )
        .order("created_at", { ascending: true })

      setMessages(data || [])

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("recipient_id", userId)
        .eq("sender_id", selectedConversation)
    }

    fetchMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${userId}-${selectedConversation}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(and(sender_id=eq.${userId},recipient_id=eq.${selectedConversation}),and(sender_id=eq.${selectedConversation},recipient_id=eq.${userId}))`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [selectedConversation, userId, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedConversation) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: userId,
        recipient_id: selectedConversation,
        content: messageInput,
      })

      if (error) throw error
      setMessageInput("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Conversations List */}
      <div
        className={`w-full sm:w-80 border-r border-border flex flex-col ${selectedConversation ? "hidden sm:flex" : ""}`}
      >
        <div className="border-b border-border p-4">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const partnerId = conv.sender_id === userId ? conv.recipient_id : conv.sender_id
              return (
                <button
                  key={partnerId}
                  onClick={() => setSelectedConversation(partnerId)}
                  className={`w-full p-4 border-b border-border text-left hover:bg-card transition-colors ${
                    selectedConversation === partnerId ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      {conv.profiles.avatar_url ? (
                        <img
                          src={conv.profiles.avatar_url || "/placeholder.svg"}
                          alt={conv.profiles.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {conv.profiles.username[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{conv.profiles.username}</p>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation && selectedPartner ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-border p-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)} className="sm:hidden">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              {selectedPartner.profiles.avatar_url ? (
                <img
                  src={selectedPartner.profiles.avatar_url || "/placeholder.svg"}
                  alt={selectedPartner.profiles.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-primary">
                  {selectedPartner.profiles.username[0].toUpperCase()}
                </span>
              )}
            </div>
            <h3 className="font-semibold">{selectedPartner.profiles.username}</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender_id === userId ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="border-t border-border p-4 flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
            />
            <Button type="submit" size="sm" disabled={isLoading || !messageInput.trim()} className="gap-2">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 items-center justify-center text-muted-foreground">
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  )
}
