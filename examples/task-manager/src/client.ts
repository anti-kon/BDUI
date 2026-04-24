import type { Contract } from '@bdui/core';
import { mount } from '@bdui/renderer-web';

const DEFAULT_CONTRACT_URL = '/contract.json';

async function loadContract(url: string): Promise<Contract> {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Failed to load contract: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as Contract;
}

async function bootstrap(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) {
    throw new Error('Missing #app container');
  }

  const contract = await loadContract(DEFAULT_CONTRACT_URL);
  const mounted = mount(app, contract, { urlSync: true });

  (window as unknown as { __taskly?: unknown }).__taskly = mounted;

  window.addEventListener('beforeunload', () => mounted.dispose());
}

bootstrap().catch((error: unknown) => {
  const app = document.getElementById('app');
  const message =
    error instanceof Error ? error.message : String(error ?? 'unknown bootstrap error');
  if (app) {
    app.textContent = `Taskly failed to start: ${message}`;
  }
  console.error(error);
});
