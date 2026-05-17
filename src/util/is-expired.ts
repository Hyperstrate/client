export const isExpired = (expiresOn?: Date | null, thresholdSeconds = 60): boolean => {
  if (!expiresOn) return true
  const expiry = expiresOn.getTime()
  const now = Date.now()
  return expiry - thresholdSeconds * 1000 < now
}
