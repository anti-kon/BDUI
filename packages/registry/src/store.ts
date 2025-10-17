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

function hash(obj: unknown) {
  const json = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return crypto.createHash('sha256').update(json).digest('hex');
}

export function putContract(contract: Contract, tags: string[] = []) {
  const id = contract?.meta?.contractId;
  const version = contract?.meta?.version;
  if (!id || !version) throw new Error('contract.meta.contractId and .version are required');
  const key = `${id}@${version}`;
  const payload: Stored = {
    id,
    version,
    contract,
    etag: `"${hash(contract)}"`,
    createdAt: new Date().toISOString(),
    tags,
  };
  contracts.set(key, payload);
  const arr = byId.get(id) || [];
  const existingIdx = arr.findIndex((s) => s.version === version);
  if (existingIdx >= 0) arr.splice(existingIdx, 1);
  arr.unshift(payload);
  byId.set(id, arr);
  return payload;
}

export function getContract(id: string, version?: string) {
  if (version) return contracts.get(`${id}@${version}`) || null;
  const arr = byId.get(id) || [];
  return arr[0] || null;
}
