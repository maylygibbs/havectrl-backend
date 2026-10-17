export function hostnameFromHeaders(headers: Record<string, unknown>): string | null {
  const sources = [headers.origin, headers.referer, headers['x-forwarded-host'], headers.host];
  for (const raw of sources) {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value !== 'string' || !value.trim()) continue;
    const host = parseHost(value);
    if (host) return host;
  }
  return null;
}

function parseHost(value: string): string | null {
  const trimmed = value.trim();
  try {
    if (trimmed.includes('://')) return new URL(trimmed).hostname.toLowerCase();
  } catch {
    /* sigue con el texto crudo */
  }
  const host = trimmed.split('/')[0].split(':')[0].toLowerCase();
  return host || null;
}
