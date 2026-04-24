import type { StoredContract } from './types.js';

export interface StorageAdapter {
  /** Persists a contract version; returns the stored record (with assigned etag). */
  put(stored: StoredContract): Promise<StoredContract> | StoredContract;
  /** Returns a specific version of a contract or null when absent. */
  get(contractId: string, version: string): Promise<StoredContract | null> | StoredContract | null;
  /** Returns all versions of a contract, newest first. */
  list(contractId: string): Promise<readonly StoredContract[]> | readonly StoredContract[];
  /** Returns the list of known contract ids. */
  listIds(): Promise<readonly string[]> | readonly string[];
  /** Removes a specific version; returns true when anything was deleted. */
  remove?(contractId: string, version: string): Promise<boolean> | boolean;
}
