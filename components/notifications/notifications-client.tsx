"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Heart, MessageSquare, Share2, Trash2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: string
  related_user_id: string
  related_post_id: string | null
  created_at: string
  read_at: string | null
  profiles: {
    username: string
    avatar_url: string | null
  }
}

interface NotificationsClientProps {
  userId: string
  initialNotifications: Notification[]
}

export function NotificationsClient({ userId, initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const supabase = createClient()

  const handleMarkAsRead = async (notificationId: string) => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId)

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)),
    )
  }

  const handleDelete = async (notificationId: string) => {
    await supabase.from("notifications").delete().eq("id", notificationId)
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-destructive" />
      case "comment":
        return <MessageSquare className="w-4 h-4 text-primary" />
      case "remix":
        return <Share2 className="w-4 h-4 text-accent" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case "like":
        return `${notification.profiles.username} liked your post`
      case "comment":
        return `${notification.profiles.username} commented on your post`
      case "remix":
        return `${notification.profiles.username} remixed your post`
      case "message":
        return `${notification.profiles.username} sent you a message`
      default:
        return `${notification.profiles.username} interacted with you`
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/feed">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
      </header>

      {/* Notifications List */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  !notification.read_at ? "border-primary/50 bg-primary/5" : ""
                }`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      {notification.profiles.avatar_url ? (
                        <img
                          src={notification.profiles.avatar_url || "/placeholder.svg"}
                          alt={notification.profiles.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {notification.profiles.username[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <p className="text-sm font-medium">{getNotificationText(notification)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(notification.id)
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
