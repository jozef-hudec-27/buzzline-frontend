export function restrictLength(s: string, max: number): string {
  return s.length > max ? s.substring(0, max) + '...' : s
}

export function timeSince(dateString: string): string {
  const date = new Date(dateString)

  //   @ts-ignore
  const seconds = Math.floor((new Date() - date) / 1000)

  let interval = seconds / 31536000

  if (interval > 1) {
    return Math.floor(interval) + 'y'
  }

  interval = seconds / 2592000

  if (interval > 1) {
    return Math.floor(interval) + 'mo'
  }

  interval = seconds / 86400

  if (interval > 1) {
    return Math.floor(interval) + 'd'
  }

  interval = seconds / 3600

  if (interval > 1) {
    return Math.floor(interval) + 'h'
  }

  interval = seconds / 60

  if (interval > 1) {
    return Math.floor(interval) + 'm'
  }

  return Math.max(0, Math.floor(seconds)) + ' s'
}

export function randomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)

  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function streamToString(stream: any) {
  const reader = stream.getReader()
  const textDecoder = new TextDecoder()
  let result = ''

  async function read() {
    const { done, value } = await reader.read()

    if (done) {
      return result
    }

    result += textDecoder.decode(value, { stream: true })
    return read()
  }

  return read()
}

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
