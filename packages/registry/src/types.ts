import type { Contract as ContractDocument } from '@bdui/common';

export type Contract = ContractDocument;

export type PublishRequest = {
  contract: Contract;
  tags?: string[];
};

export type ResolveRequest = {
  contractId: string;
  version?: string;
  routeId: string;
  state?: {
    flow?: Record<string, unknown>;
    session?: Record<string, unknown>;
    local?: Record<string, unknown>;
  };
  currentStepId?: string;
};

export type AdvanceRequest = {
  contractId: string;
  version?: string;
  routeId: string;
  currentStepId: string;
  state?: {
    flow?: Record<string, unknown>;
    session?: Record<string, unknown>;
    local?: Record<string, unknown>;
  };
};
