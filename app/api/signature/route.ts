import { NextResponse } from 'next/server'

import { generateSignature } from '@/app/utils/utils'

export const runtime = 'edge'

export async function POST(req: Request) {
  const requestBody = await req.text()
  const signature = await generateSignature(requestBody, process.env.SIGNATURE_SECRET || '')
  return NextResponse.json({ signature })
}
