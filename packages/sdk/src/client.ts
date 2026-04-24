import type { Contract } from '@bdui/core';

export interface RegistryClientOptions {
  readonly baseUrl: string;
  readonly fetch?: typeof fetch;
  readonly defaultHeaders?: Readonly<Record<string, string>>;
}

export interface PublishOptions {
  readonly contract: Contract;
  readonly tags?: readonly string[];
  readonly compatFrom?: string;
}

export interface PublishResult {
  readonly contractId: string;
  readonly version: string;
  readonly etag: string;
  readonly createdAt: string;
  readonly tags: readonly string[];
  readonly compatFrom?: string;
}

export interface ResolveOptions {
  readonly contractId: string;
  readonly version?: string;
  readonly compatFrom?: string;
  readonly routeId?: string;
  readonly currentStepId?: string;
  readonly state?: Record<string, unknown>;
  readonly ifNoneMatch?: string;
}

export interface ResolveResult<T = unknown> {
  readonly status: number;
  readonly etag?: string;
  readonly contract?: Contract;
  readonly resolved?: T;
  readonly version?: string;
  readonly contractId?: string;
  readonly notModified: boolean;
}

export interface VersionInfo {
  readonly version: string;
  readonly etag: string;
  readonly createdAt: string;
  readonly tags: readonly string[];
  readonly compatFrom?: string;
}

export class RegistryClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly defaultHeaders: Readonly<Record<string, string>>;

  constructor(options: RegistryClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.fetchImpl = options.fetch ?? fetch;
    this.defaultHeaders = options.defaultHeaders ?? {};
  }

  async publish(options: PublishOptions): Promise<PublishResult> {
    const response = await this.fetchImpl(`${this.baseUrl}/v1/contracts`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...this.defaultHeaders,
      },
      body: JSON.stringify({
        contract: options.contract,
        tags: options.tags,
        compatFrom: options.compatFrom,
      }),
    });
    if (!response.ok) {
      throw await toError(response, 'publish failed');
    }
    return (await response.json()) as PublishResult;
  }

  async listVersions(contractId: string): Promise<readonly VersionInfo[]> {
    const url = new URL('/v1/versions', this.baseUrl);
    url.searchParams.set('id', contractId);
    const response = await this.fetchImpl(url.toString(), { headers: this.defaultHeaders });
    if (!response.ok) {
      throw await toError(response, 'listVersions failed');
    }
    const body = (await response.json()) as { items: VersionInfo[] };
    return body.items;
  }

  async resolve<T = unknown>(options: ResolveOptions): Promise<ResolveResult<T>> {
    const url = new URL('/v1/resolve', this.baseUrl);
    url.searchParams.set('id', options.contractId);
    if (options.version) url.searchParams.set('version', options.version);
    if (options.compatFrom) url.searchParams.set('compatFrom', options.compatFrom);
    if (options.routeId) url.searchParams.set('routeId', options.routeId);
    if (options.currentStepId) url.searchParams.set('currentStepId', options.currentStepId);
    if (options.state) url.searchParams.set('state', JSON.stringify(options.state));
    const headers: Record<string, string> = { ...this.defaultHeaders };
    if (options.ifNoneMatch) headers['if-none-match'] = options.ifNoneMatch;
    const response = await this.fetchImpl(url.toString(), { headers });
    if (response.status === 304) {
      return {
        status: 304,
        etag: response.headers.get('etag') ?? undefined,
        notModified: true,
      };
    }
    if (!response.ok) {
      throw await toError(response, 'resolve failed');
    }
    const body = (await response.json()) as {
      contractId: string;
      version: string;
      etag?: string;
      contract?: Contract;
      resolved?: T;
    };
    return {
      status: response.status,
      etag: body.etag ?? response.headers.get('etag') ?? undefined,
      contract: body.contract,
      resolved: body.resolved,
      version: body.version,
      contractId: body.contractId,
      notModified: false,
    };
  }

  async getContract(
    contractId: string,
    version?: string,
    ifNoneMatch?: string,
  ): Promise<ResolveResult> {
    const url = new URL(
      version
        ? `/v1/contracts/${encodeURIComponent(contractId)}/${encodeURIComponent(version)}`
        : `/v1/contracts/${encodeURIComponent(contractId)}`,
      this.baseUrl,
    );
    const headers: Record<string, string> = { ...this.defaultHeaders };
    if (ifNoneMatch) headers['if-none-match'] = ifNoneMatch;
    const response = await this.fetchImpl(url.toString(), { headers });
    if (response.status === 304) {
      return { status: 304, etag: response.headers.get('etag') ?? undefined, notModified: true };
    }
    if (!response.ok) {
      throw await toError(response, 'getContract failed');
    }
    const contract = (await response.json()) as Contract;
    return {
      status: response.status,
      etag: response.headers.get('etag') ?? undefined,
      contract,
      notModified: false,
      contractId,
      version: contract.meta?.version,
    };
  }
}

async function toError(response: Response, fallback: string): Promise<Error> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }
  const message =
    (body as { error?: { message?: string } })?.error?.message ??
    `${fallback} (${response.status})`;
  const error = new Error(message);
  (error as Error & { status?: number; body?: unknown }).status = response.status;
  (error as Error & { status?: number; body?: unknown }).body = body;
  return error;
}
