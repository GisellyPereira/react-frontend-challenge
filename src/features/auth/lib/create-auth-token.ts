export function createAuthToken() {
  return `libris_${crypto.randomUUID()}`
}
