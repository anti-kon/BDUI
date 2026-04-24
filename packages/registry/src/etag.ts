import crypto from 'node:crypto';

export function computeEtag(value: unknown): string {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  const digest = crypto.createHash('sha256').update(serialized).digest('hex');
  return `"${digest}"`;
}

export function matchesEtag(ifNoneMatch: string | undefined | null, etag: string): boolean {
  if (!ifNoneMatch) return false;
  const parts = ifNoneMatch
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.includes('*')) return true;
  return parts.includes(etag);
}
