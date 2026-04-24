import fs from 'node:fs';
import path from 'node:path';

import { buildContract } from '@bdui/transpiler';

export interface RunWatchOptions {
  readonly entry: string;
  readonly outFile?: string;
  readonly mode?: 'dev' | 'prod';
  readonly watchDir?: string;
}

export async function runWatch(options: RunWatchOptions): Promise<void> {
  const entryPath = path.resolve(options.entry);
  const watchDir = options.watchDir ? path.resolve(options.watchDir) : path.dirname(entryPath);

  let pending = false;
  let scheduled: NodeJS.Timeout | null = null;

  const rebuild = async () => {
    pending = true;
    if (scheduled) return;
    scheduled = setTimeout(async () => {
      scheduled = null;
      while (pending) {
        pending = false;
        try {
          const started = Date.now();
          await buildContract({
            entry: entryPath,
            outFile: options.outFile,
            mode: options.mode,
            validate: true,
          });
          const elapsed = Date.now() - started;

          console.log(`[bdui/watch] rebuilt contract in ${elapsed}ms`);
        } catch (error) {
          console.error('[bdui/watch] build error:', (error as Error).message);
        }
      }
    }, 75);
  };

  await rebuild();

  const watcher = fs.watch(watchDir, { recursive: true }, (event, filename) => {
    if (!filename) return;
    if (filename.endsWith('.tsx') || filename.endsWith('.ts') || filename.endsWith('.json')) {
      rebuild().catch((error) => console.error('[bdui/watch]', error));
    }
  });

  const stop = () => {
    watcher.close();
    if (scheduled) clearTimeout(scheduled);
  };
  process.on('SIGINT', () => {
    stop();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    stop();
    process.exit(0);
  });
}
