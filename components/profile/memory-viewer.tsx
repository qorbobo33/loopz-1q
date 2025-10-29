"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface MemoryViewerProps {
  memory: {
    id: string
    animation_data: {
      type: string
      color: string
      duration: number
      particles: number
      intensity: string
      pattern: string
      keyframes: Array<{ time: number; scale: number; opacity: number }>
    }
  }
}

export function MemoryViewer({ memory }: MemoryViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const animationData = memory.animation_data
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      life: number
      size: number
    }> = []

    // Initialize particles
    for (let i = 0; i < animationData.particles; i++) {
      const angle = (i / animationData.particles) * Math.PI * 2
      const speed = animationData.intensity === "high" ? 3 : animationData.intensity === "low" ? 1 : 2

      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: Math.random() * 4 + 2,
      })
    }

    const startTime = Date.now()
    const duration = animationData.duration * 1000

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Clear canvas
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life -= 1 / (animationData.duration * 60)
        particle.vy += 0.1 // gravity

        if (particle.life > 0) {
          ctx.fillStyle =
            animationData.color +
            Math.floor(particle.life * 255)
              .toString(16)
              .padStart(2, "0")
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [memory])

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <canvas ref={canvasRef} className="w-full aspect-square bg-gradient-to-br from-primary/5 to-accent/5" />
      </CardContent>
    </Card>
  )
}
