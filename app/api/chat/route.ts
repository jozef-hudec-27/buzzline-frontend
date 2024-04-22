import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'

import { generateSignature } from '../signature/route'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

function verifySignature(trusted: string, untrusted: string): boolean {
  return trusted === untrusted
}

async function getChatCompletion(messages: any): Promise<StreamingTextResponse | NextResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages,
    })
    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (e: any) {
    return NextResponse.json({ error: e.error || 'Error' }, { status: e.status || 500 })
  }
}

export async function POST(req: Request) {
  try {
    const requestBody = await req.text()
    const trusted = await generateSignature(requestBody, process.env.SIGNATURE_SECRET || '')
    const untrusted = req.headers.get('x-hub-signature-256') || ''

    if (!verifySignature(trusted, untrusted)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { messages } = JSON.parse(requestBody)
    return await getChatCompletion(messages)
  } catch (error) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
}
