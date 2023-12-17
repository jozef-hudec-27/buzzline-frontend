export function restrictLength(s: string, max: number): string {
  return s.length > max ? s.substring(0, max) + '...' : s
}
