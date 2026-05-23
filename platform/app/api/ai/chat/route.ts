export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { messages, topicContext } = await req.json()

  const topicPart = topicContext ? ` The user is currently studying: "${topicContext}".` : ''
  const systemPrompt = `You are an expert software engineering tutor for EngineerTutorial, specializing in system design, distributed systems, Apache Kafka, low-level design (LLD), high-level design (HLD), AWS, and GenAI.${topicPart} Be concise, practical, and use examples from real systems (Netflix, Google, Uber, etc.). Format code with markdown code blocks. Keep responses focused and under 400 words unless the user asks for more detail.`

  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
      max_tokens: 800,
      temperature: 0.7,
    })

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) controller.enqueue(new TextEncoder().encode(text))
          }
        } finally {
          controller.close()
        }
      },
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'AI unavailable' }, { status: 500 })
  }
}
