import type { Contract } from '@bdui/core';
import { validateContract } from '@bdui/schema';

import type { StorageAdapter } from './adapter.js';
import { RegistryError } from './errors.js';
import { computeEtag } from './etag.js';
import { isValidVersion, pickCompatibleVersion } from './semver.js';
import type { PublishRequest, StoredContract } from './types.js';

export interface ContractStoreOptions {
  readonly storage: StorageAdapter;
  readonly validate?: boolean;
  readonly now?: () => Date;
}

export class ContractStore {
  private readonly storage: StorageAdapter;
  private readonly validate: boolean;
  private readonly now: () => Date;

  constructor(options: ContractStoreOptions) {
    this.storage = options.storage;
    this.validate = options.validate ?? true;
    this.now = options.now ?? (() => new Date());
  }

  async publish(request: PublishRequest): Promise<StoredContract> {
    const contract = request.contract;
    if (!contract || typeof contract !== 'object') {
      throw new RegistryError('BAD_REQUEST', 'contract body is required');
    }
    const meta = (contract as Contract).meta;
    if (!meta?.contractId || !meta.version) {
      throw new RegistryError('BAD_REQUEST', 'contract.meta.contractId and .version are required');
    }
    if (!isValidVersion(meta.version)) {
      throw new RegistryError(
        'BAD_REQUEST',
        `contract.meta.version must be a valid SemVer, received: ${meta.version}`,
      );
    }
    if (this.validate) {
      const report = validateContract(contract);
      if (!report.ok) {
        throw new RegistryError(
          'VALIDATION_FAILED',
          'contract failed schema validation',
          report.errors,
        );
      }
    }
    const existing = await this.storage.get(meta.contractId, meta.version);
    if (existing) {
      throw new RegistryError(
        'CONFLICT',
        `version ${meta.version} for contract ${meta.contractId} already exists`,
      );
    }
    const stored: StoredContract = {
      contractId: meta.contractId,
      version: meta.version,
      contract: contract as Contract,
      etag: computeEtag(contract),
      createdAt: this.now().toISOString(),
      tags: request.tags ? [...request.tags] : [],
      compatFrom: request.compatFrom,
    };
    return await this.storage.put(stored);
  }

  async getVersion(contractId: string, version: string): Promise<StoredContract> {
    if (!isValidVersion(version)) {
      throw new RegistryError('BAD_REQUEST', `invalid SemVer version: ${version}`);
    }
    const stored = await this.storage.get(contractId, version);
    if (!stored) {
      throw new RegistryError('NOT_FOUND', `contract ${contractId}@${version} was not found`);
    }
    return stored;
  }

  async resolveVersion(
    contractId: string,
    range?: string,
    compatFrom?: string,
  ): Promise<StoredContract> {
    const list = await this.storage.list(contractId);
    if (list.length === 0) {
      throw new RegistryError('NOT_FOUND', `no versions published for contract ${contractId}`);
    }
    const versions = list.map((entry) => entry.version);
    const picked = pickCompatibleVersion(versions, range, compatFrom);
    if (!picked) {
      throw new RegistryError(
        'NOT_FOUND',
        `no version matches range "${range ?? '*'}" (compatFrom=${compatFrom ?? 'none'})`,
      );
    }
    const stored = list.find((entry) => entry.version === picked);
    if (!stored) {
      throw new RegistryError('NOT_FOUND', `picked version ${picked} disappeared from storage`);
    }
    return stored;
  }

  async listVersions(contractId: string): Promise<readonly StoredContract[]> {
    return await this.storage.list(contractId);
  }

  async listContracts(): Promise<readonly string[]> {
    return await this.storage.listIds();
  }
}
