import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { image, mood } = await request.json()

    const { text: caption } = await generateText({
      model: "openai/gpt-4-vision",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: image,
            },
            {
              type: "text",
              text: `Generate a creative and engaging caption for this image. The user is feeling ${mood}. Keep it concise (under 280 characters), fun, and relevant to the mood. Just provide the caption without any additional text.`,
            },
          ],
        },
      ],
    })

    return Response.json({ caption: caption.trim() })
  } catch (error) {
    console.error("Error generating caption:", error)
    return Response.json({ error: "Failed to generate caption" }, { status: 500 })
  }
}
