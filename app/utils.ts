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

  return Math.floor(seconds) + ' s'
}
