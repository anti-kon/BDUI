import type { Contract } from '@bdui/core';
import { mount } from '@bdui/renderer-web';
import {
  type ContractFetchResult,
  createContractLoader,
  createLocalStorageAdapter,
  type StateValidator,
} from '@bdui/runtime';

const DEFAULT_CONTRACT_URL = '/contract.json';

function contractSourceLabel(source: string): string {
  switch (source) {
    case 'network':
      return 'сеть';
    case 'cache':
      return 'кэш';
    case 'stale':
      return 'устаревший кэш';
    default:
      return source;
  }
}

async function fetchContract(args: {
  readonly url: string;
  readonly ifNoneMatch?: string;
}): Promise<ContractFetchResult> {
  const headers: Record<string, string> = { accept: 'application/json' };
  if (args.ifNoneMatch) headers['if-none-match'] = args.ifNoneMatch;

  const response = await fetch(args.url, { headers });
  if (response.status === 304) {
    return {
      contract: {} as Contract,
      etag: args.ifNoneMatch,
      notModified: true,
      ttlMs: 15_000,
    };
  }
  if (!response.ok) {
    throw new Error(`Failed to load contract: ${response.status} ${response.statusText}`);
  }
  return {
    contract: (await response.json()) as Contract,
    etag: response.headers.get('etag') ?? undefined,
    ttlMs: 15_000,
  };
}

const validators: Readonly<Record<string, StateValidator>> = {
  requestIntake(value, context) {
    const summary = String(value ?? '').trim();
    const priority = String(context.state.flow?.requestPriority ?? 'Обычный');
    const errors: string[] = [];

    if (summary.length < 12) {
      errors.push('Описание должно быть не короче 12 символов.');
    }
    if (priority === 'Срочный' && summary.length < 24) {
      errors.push('Для срочной заявки нужно более конкретное описание.');
    }

    return { ok: errors.length === 0, errors };
  },
};

async function bootstrap(): Promise<void> {
  const app = document.getElementById('app');
  const cacheStatus = document.getElementById('cache-status');
  if (!app) {
    throw new Error('Missing #app container');
  }

  const loader = createContractLoader({
    storage: createLocalStorageAdapter(),
    fetcher: fetchContract,
    cachePrefix: 'taskly_contract_',
    defaultTtlMs: 15_000,
    onRevalidate() {
      if (cacheStatus) cacheStatus.textContent = 'Кэш контракта обновлён в фоне';
    },
  });

  const result = await loader.load(DEFAULT_CONTRACT_URL);
  if (cacheStatus) {
    cacheStatus.textContent = `Источник контракта: ${contractSourceLabel(result.source)}`;
  }

  const mounted = mount(app, result.contract, {
    urlSync: true,
    validators,
    prefetchScreens(screens) {
      console.info('[BDUI demo] запрошен prefetch:', screens.join(', '));
    },
  });

  app.classList.remove('loading');
  mounted.runtime.state.write('flow', 'contractCacheSource', contractSourceLabel(result.source));

  (window as unknown as { __taskly?: unknown }).__taskly = {
    ...mounted,
    contractSource: result.source,
  };

  window.addEventListener('beforeunload', () => mounted.dispose());
}

bootstrap().catch((error: unknown) => {
  const app = document.getElementById('app');
  const message =
    error instanceof Error ? error.message : String(error ?? 'unknown bootstrap error');
  if (app) {
    app.textContent = `Не удалось запустить пример: ${message}`;
  }
  console.error(error);
});
