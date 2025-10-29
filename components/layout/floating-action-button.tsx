"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { CreatePostModal } from "@/components/feed/create-post-modal"

interface FloatingActionButtonProps {
  userId: string
  onPostCreated: (post: any) => void
}

export function FloatingActionButton({ userId, onPostCreated }: FloatingActionButtonProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsCreateOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        userId={userId}
        onPostCreated={(newPost) => {
          onPostCreated(newPost)
          setIsCreateOpen(false)
        }}
      />
    </>
  )
}
