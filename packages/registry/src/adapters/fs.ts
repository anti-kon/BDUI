import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { StorageAdapter } from '../adapter.js';
import { compareVersions } from '../semver.js';
import type { StoredContract } from '../types.js';

export interface FileSystemStorageOptions {
  readonly rootDir: string;
}

/**
 * Stores contracts on disk as JSON files: `<rootDir>/<contractId>/<version>.json`.
 *
 * A sidecar `<version>.json.meta.json` keeps etag/createdAt/tags so we do not
 * recompute those on every read.
 */
export class FileSystemStorageAdapter implements StorageAdapter {
  private readonly rootDir: string;

  constructor(options: FileSystemStorageOptions) {
    this.rootDir = path.resolve(options.rootDir);
  }

  private contractDir(contractId: string): string {
    return path.join(this.rootDir, encodeURIComponent(contractId));
  }

  private files(contractId: string, version: string): { json: string; meta: string } {
    const dir = this.contractDir(contractId);
    const base = path.join(dir, encodeURIComponent(version));
    return { json: `${base}.json`, meta: `${base}.meta.json` };
  }

  async put(stored: StoredContract): Promise<StoredContract> {
    const { json, meta } = this.files(stored.contractId, stored.version);
    await fs.mkdir(path.dirname(json), { recursive: true });
    const contractText = JSON.stringify(stored.contract);
    await fs.writeFile(json, contractText, 'utf8');
    const metaPayload = {
      etag: stored.etag,
      createdAt: stored.createdAt,
      tags: [...stored.tags],
      compatFrom: stored.compatFrom,
    };
    await fs.writeFile(meta, JSON.stringify(metaPayload, null, 2), 'utf8');
    return stored;
  }

  async get(contractId: string, version: string): Promise<StoredContract | null> {
    const { json, meta } = this.files(contractId, version);
    try {
      const [contractText, metaText] = await Promise.all([
        fs.readFile(json, 'utf8'),
        fs.readFile(meta, 'utf8'),
      ]);
      const contract = JSON.parse(contractText);
      const parsedMeta = JSON.parse(metaText) as {
        etag: string;
        createdAt: string;
        tags: string[];
        compatFrom?: string;
      };
      return {
        contractId,
        version,
        contract,
        etag: parsedMeta.etag,
        createdAt: parsedMeta.createdAt,
        tags: parsedMeta.tags,
        compatFrom: parsedMeta.compatFrom,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  async list(contractId: string): Promise<readonly StoredContract[]> {
    const dir = this.contractDir(contractId);
    let entries: string[];
    try {
      entries = await fs.readdir(dir);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
    const versions = entries
      .filter((name) => name.endsWith('.json') && !name.endsWith('.meta.json'))
      .map((name) => decodeURIComponent(name.slice(0, -'.json'.length)));
    const results = await Promise.all(versions.map((version) => this.get(contractId, version)));
    return results
      .filter((entry): entry is StoredContract => entry !== null)
      .sort((a, b) => compareVersions(b.version, a.version));
  }

  async listIds(): Promise<readonly string[]> {
    try {
      const entries = await fs.readdir(this.rootDir);
      return entries.map((name) => decodeURIComponent(name)).sort();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
  }

  async remove(contractId: string, version: string): Promise<boolean> {
    const { json, meta } = this.files(contractId, version);
    try {
      await Promise.all([fs.unlink(json), fs.unlink(meta)]);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
      throw error;
    }
  }
}

export function createFileSystemStorage(options: FileSystemStorageOptions): StorageAdapter {
  return new FileSystemStorageAdapter(options);
}
