import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, describe, expect, it } from 'vitest';

import { buildContract } from '../index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, 'fixtures');

describe('buildContract', () => {
  const artifactsToCleanup: string[] = [];

  afterAll(() => {
    for (const entry of artifactsToCleanup) {
      try {
        fs.rmSync(entry, { force: true });
      } catch {
        /* ignore */
      }
    }
  });

  it('produces deterministic JSON for the same input', async () => {
    const entry = path.join(FIXTURES, 'minimal.tsx');
    const outA = path.join(FIXTURES, '.out-a.json');
    const outB = path.join(FIXTURES, '.out-b.json');
    artifactsToCleanup.push(outA, outB);

    const a = await buildContract({ entry, outFile: outA, mode: 'prod' });
    const b = await buildContract({ entry, outFile: outB, mode: 'prod' });

    expect(a.json).toBe(b.json);
    expect(fs.readFileSync(outA, 'utf-8')).toBe(fs.readFileSync(outB, 'utf-8'));
  });

  it('cleans up intermediate build artefacts', async () => {
    const entry = path.join(FIXTURES, 'minimal.tsx');
    await buildContract({ entry, mode: 'prod' });

    const leftovers = fs.readdirSync(FIXTURES).filter((file) => file.startsWith('.bdui-build-'));

    expect(leftovers).toEqual([]);
  });

  it('validates contract shape and contains expected structure', async () => {
    const entry = path.join(FIXTURES, 'minimal.tsx');
    const { contract } = await buildContract({ entry, mode: 'prod' });
    expect(contract.meta.contractId).toBe('com.example.mini');
    expect(contract.meta.generatedAt).toBe('1970-01-01T00:00:00.000Z');
    expect(contract.navigation.initialRoute).toBe('home');
  });
});
