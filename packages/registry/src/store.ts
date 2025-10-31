import crypto from 'node:crypto';

import type { Contract } from './types.js';

export type Stored = {
  id: string;
  version: string;
  contract: Contract;
  etag: string;
  createdAt: string;
  tags: string[];
};

const contracts = new Map<string, Stored>();
const byId = new Map<string, Stored[]>();
const byTag = new Map<string, Stored[]>();

function hash(obj: unknown) {
  const json = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return crypto.createHash('sha256').update(json).digest('hex');
}

function normalizeTags(tags: string[]): string[] {
  const unique = new Set<string>();
  for (const tag of tags) {
    if (typeof tag !== 'string') continue;
    const trimmed = tag.trim();
    if (!trimmed) continue;
    unique.add(trimmed);
  }
  return Array.from(unique);
}

function indexByTag(entry: Stored) {
  for (const tag of entry.tags) {
    const list = byTag.get(tag) ?? [];
    const existingIdx = list.findIndex((s) => s.id === entry.id && s.version === entry.version);
    if (existingIdx >= 0) list.splice(existingIdx, 1);
    list.unshift(entry);
    byTag.set(tag, list);
  }
}

function removeFromTags(entry: Stored) {
  for (const tag of entry.tags) {
    const list = byTag.get(tag);
    if (!list) continue;
    const idx = list.findIndex((s) => s.id === entry.id && s.version === entry.version);
    if (idx >= 0) {
      list.splice(idx, 1);
    }
    if (list.length === 0) {
      byTag.delete(tag);
    }
  }
}

export function putContract(contract: Contract, tags: string[] = []) {
  const id = contract?.meta?.contractId;
  const version = contract?.meta?.version;
  if (!id || !version) throw new Error('contract.meta.contractId and .version are required');
  const key = `${id}@${version}`;
  const normalizedTags = normalizeTags(tags);
  const payload: Stored = {
    id,
    version,
    contract,
    etag: `"${hash(contract)}"`,
    createdAt: new Date().toISOString(),
    tags: normalizedTags,
  };
  const existing = contracts.get(key);
  if (existing) {
    removeFromTags(existing);
  }
  contracts.set(key, payload);
  const arr = byId.get(id) || [];
  const existingIdx = arr.findIndex((s) => s.version === version);
  if (existingIdx >= 0) {
    const [removed] = arr.splice(existingIdx, 1);
    if (removed) removeFromTags(removed);
  }
  arr.unshift(payload);
  byId.set(id, arr);
  indexByTag(payload);
  return payload;
}

export function getContract(id: string, version?: string) {
  if (version) return contracts.get(`${id}@${version}`) || null;
  const arr = byId.get(id) || [];
  return arr[0] || null;
}

export function listContracts(id?: string) {
  if (id) return [...(byId.get(id) ?? [])];
  return Array.from(contracts.values());
}

export function findContractsByTag(tag: string) {
  return [...(byTag.get(tag) ?? [])];
}

export function clearStore() {
  contracts.clear();
  byId.clear();
  byTag.clear();
}
