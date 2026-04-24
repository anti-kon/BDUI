import type { Navigation } from './navigation.js';
import type { InitialState } from './state.js';

/** Contract-wide theme. */
export interface Theme {
  readonly followSystem?: boolean;
  readonly allowUserOverride?: boolean;
  readonly palette?: Readonly<Record<string, unknown>>;
  readonly tokens?: Readonly<Record<string, unknown>>;
}

/** Declaration of a data source the runtime may fetch. */
export interface DataSource {
  readonly id: string;
  readonly kind: 'rest' | 'graphql' | 'static';
  readonly url?: string;
  readonly method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: unknown;
  readonly value?: unknown;
}

export interface Meta {
  readonly contractId: string;
  readonly version: string;
  readonly schemaVersion: string;
  readonly generatedAt: string;
  readonly appId?: string;
  /**
   * Minimum renderer version that can execute this contract (SemVer).
   * Used by the registry to resolve back-compatible versions.
   */
  readonly compatFrom?: string;
  readonly signature?: string;
  readonly features?: Readonly<Record<string, unknown>>;
}

/** Root of the BDUI contract. */
export interface Contract {
  readonly meta: Meta;
  readonly theme?: Theme;
  readonly dataSources?: readonly DataSource[];
  readonly navigation: Navigation;
  readonly initial?: InitialState;
}

export const SCHEMA_VERSION = '1.0.0';
