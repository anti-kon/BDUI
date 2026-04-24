import semver from 'semver';

/** Compares two SemVer versions. Returns negative if a < b, zero if equal, positive otherwise. */
export function compareVersions(a: string, b: string): number {
  const va = semver.parse(a, { loose: true });
  const vb = semver.parse(b, { loose: true });
  if (va && vb) return va.compare(vb);
  if (va) return 1;
  if (vb) return -1;
  return a.localeCompare(b);
}

/** Returns true when `version` satisfies `range` (SemVer). */
export function satisfiesRange(version: string, range: string): boolean {
  return semver.satisfies(version, range, { includePrerelease: true });
}

/**
 * Picks the newest version within `candidates` that satisfies `range`.
 * When `compatFrom` is supplied, the returned version must also be
 * backward-compatible with it (same or higher major when range is absent).
 */
export function pickCompatibleVersion(
  candidates: readonly string[],
  range?: string,
  compatFrom?: string,
): string | null {
  const ordered = [...candidates].sort((a, b) => compareVersions(b, a));
  for (const candidate of ordered) {
    if (range && !satisfiesRange(candidate, range)) continue;
    if (compatFrom) {
      const pick = semver.parse(candidate, { loose: true });
      const from = semver.parse(compatFrom, { loose: true });
      if (!pick || !from) continue;
      if (pick.major !== from.major) continue;
      if (semver.lt(pick, from)) continue;
    }
    return candidate;
  }
  return null;
}

export function isValidVersion(version: string): boolean {
  return semver.valid(version, { loose: true }) !== null;
}
