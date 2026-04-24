import type { Contract, RuntimeStateLike } from '@bdui/core';

export type StoredContract = {
  readonly contractId: string;
  readonly version: string;
  readonly contract: Contract;
  readonly etag: string;
  readonly createdAt: string;
  readonly tags: readonly string[];
  readonly compatFrom?: string;
};

export type ResolveParams = {
  readonly contractId: string;
  readonly version?: string;
  readonly compatFrom?: string;
  readonly routeId?: string;
  readonly currentStepId?: string;
  readonly state?: RuntimeStateLike;
};

export type ResolveVersionResult = {
  readonly stored: StoredContract;
};

export type PublishRequest = {
  readonly contract: Contract;
  readonly tags?: readonly string[];
  readonly compatFrom?: string;
};
