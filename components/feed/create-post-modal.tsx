"use client"

import type React from "react"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Loader2, Music, Video, X, Sparkles } from "lucide-react"

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onPostCreated: (post: any) => void
}

export function CreatePostModal({ isOpen, onClose, userId, onPostCreated }: CreatePostModalProps) {
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("neutral")
  const [isLoading, setIsLoading] = useState(false)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | null>(null)
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const moods = ["happy", "sad", "excited", "calm", "neutral", "creative"]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video" | "audio") => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSizes = { image: 5 * 1024 * 1024, video: 30 * 1024 * 1024, audio: 10 * 1024 * 1024 }
    if (file.size > maxSizes[type]) {
      alert(`File too large. Max ${maxSizes[type] / 1024 / 1024}MB`)
      return
    }

    setMediaFile(file)
    setMediaType(type)

    const reader = new FileReader()
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerateCaption = async () => {
    if (!mediaFile) {
      alert("Please upload an image first")
      return
    }

    setIsGeneratingCaption(true)
    try {
      // Convert image to base64 for AI processing
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string

        // Call AI API to generate caption based on image
        const response = await fetch("/api/ai/generate-caption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64Image,
            mood: mood,
          }),
        })

        if (!response.ok) throw new Error("Failed to generate caption")

        const { caption } = await response.json()
        setContent(caption)
      }
      reader.readAsDataURL(mediaFile)
    } catch (error) {
      console.error("Error generating caption:", error)
      alert("Failed to generate caption. Try again.")
    } finally {
      setIsGeneratingCaption(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !mediaFile) return

    setIsLoading(true)
    try {
      let mediaUrl = null
      let uploadedMediaType = null

      if (mediaFile) {
        const fileExt = mediaFile.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
        const filePath = `posts/${userId}/${fileName}`

        const { error: uploadError } = await supabase.storage.from("media").upload(filePath, mediaFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from("media").getPublicUrl(filePath)
        mediaUrl = data.publicUrl
        uploadedMediaType = mediaType
      }

      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: userId,
          content,
          mood,
          media_url: mediaUrl,
          media_type: uploadedMediaType,
        })
        .select("*, profiles(username, avatar_url), likes(count)")
        .single()

      if (error) throw error

      onPostCreated(data)
      setContent("")
      setMood("neutral")
      setMediaFile(null)
      setMediaPreview(null)
      setMediaType(null)
    } catch (error) {
      console.error("Error creating post:", error)
      alert("Failed to create post")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Loop</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-24 resize-none"
          />

          {mediaPreview && (
            <div className="relative rounded-lg overflow-hidden bg-muted">
              {mediaType === "image" && (
                <img src={mediaPreview || "/placeholder.svg"} alt="Preview" className="w-full h-48 object-cover" />
              )}
              {mediaType === "video" && <video src={mediaPreview} className="w-full h-48 object-cover" />}
              {mediaType === "audio" && (
                <div className="w-full h-24 flex items-center justify-center">
                  <Music className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setMediaFile(null)
                  setMediaPreview(null)
                  setMediaType(null)
                }}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full p-1"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">How are you feeling?</label>
            <div className="grid grid-cols-3 gap-2">
              {moods.map((m) => (
                <Button
                  key={m}
                  type="button"
                  variant={mood === m ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMood(m)}
                  className="capitalize"
                >
                  {m}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, "image")}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              disabled={isLoading || mediaFile !== null}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-4 h-4" />
              Image
            </Button>

            <input
              type="file"
              accept="video/mp4"
              onChange={(e) => handleFileSelect(e, "video")}
              className="hidden"
              id="video-input"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              disabled={isLoading || mediaFile !== null}
              onClick={() => document.getElementById("video-input")?.click()}
            >
              <Video className="w-4 h-4" />
              Video
            </Button>

            <input
              type="file"
              accept="audio/mp3"
              onChange={(e) => handleFileSelect(e, "audio")}
              className="hidden"
              id="audio-input"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              disabled={isLoading || mediaFile !== null}
              onClick={() => document.getElementById("audio-input")?.click()}
            >
              <Music className="w-4 h-4" />
              Audio
            </Button>

            {mediaType === "image" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                disabled={isGeneratingCaption || isLoading}
                onClick={handleGenerateCaption}
              >
                {isGeneratingCaption ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Caption
              </Button>
            )}

            <Button type="submit" className="flex-1 gap-2" disabled={isLoading || (!content.trim() && !mediaFile)}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Post
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
