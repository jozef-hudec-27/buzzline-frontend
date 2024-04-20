import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const requestBody = await req.text()
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(process.env.NEXT_PUBLIC_SECRET || ''),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(requestBody))
    const trusted = `sha256=${Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')}`
    const untrusted = req.headers.get('x-hub-signature-256') || ''

    if (trusted !== untrusted) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { messages } = JSON.parse(requestBody)

    try {
      // Ask OpenAI for a streaming chat completion given the prompt
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        stream: true,
        messages,
      })

      // Convert the response into a friendly text-stream
      const stream = OpenAIStream(response)
      // Respond with the stream
      return new StreamingTextResponse(stream)
    } catch (e: any) {
      return NextResponse.json({ error: e.error || 'Error' }, { status: e.status || 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
}
