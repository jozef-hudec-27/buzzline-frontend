import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function generateSignature(requestBody: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(requestBody))
  return `sha256=${Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`
}

export async function POST(req: Request) {
  const requestBody = await req.text()
  const signature = await generateSignature(requestBody, process.env.SIGNATURE_SECRET || '')
  return NextResponse.json({ signature })
}
