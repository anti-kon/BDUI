#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { validateContract } from '@bdui/schema';
import { buildContract } from '@bdui/transpiler';
import { Command } from 'commander';

import { runGen } from './commands/gen.js';
import { runRegistry } from './commands/registry.js';
import { runWatch } from './commands/watch.js';

const CLI_VERSION = '0.6.0-alpha.0';

const program = new Command();
program.name('bdui').description('BDUI command-line interface').version(CLI_VERSION);

program
  .command('gen')
  .description('Generate schema and DSL glue from component manifests')
  .option('--defs <pkg>', 'package that exports component manifests', '@bdui/defs')
  .option('--schema-out <file>', 'output path for contract.schema.json')
  .option('--glue-out <file>', 'output path for generated DSL glue')
  .option('--skip-build', 'do not invoke package builds after generation', false)
  .action(
    async (opts: { defs?: string; schemaOut?: string; glueOut?: string; skipBuild?: boolean }) => {
      try {
        await runGen({
          defsPackage: opts.defs,
          schemaOut: opts.schemaOut,
          glueOut: opts.glueOut,
          runBuild: !opts.skipBuild,
        });
        console.log('[bdui] gen: done');
      } catch (error) {
        console.error('[bdui] gen failed:', (error as Error).message);
        process.exitCode = 1;
      }
    },
  );

program
  .command('build')
  .description('Transpile a TSX entry into a JSON contract')
  .argument('<entry>', 'Entry TSX file')
  .option('-o, --out <file>', 'Output JSON file')
  .option('--mode <mode>', 'dev | prod', 'dev')
  .option('--no-validate', 'disable schema validation')
  .action(
    async (entry: string, opts: { out?: string; mode?: 'dev' | 'prod'; validate?: boolean }) => {
      try {
        const { json } = await buildContract({
          entry,
          outFile: opts.out,
          mode: opts.mode,
          validate: opts.validate,
        });
        if (!opts.out) process.stdout.write(`${json}\n`);
      } catch (error) {
        console.error('[bdui] build failed:', (error as Error).message);
        process.exitCode = 1;
      }
    },
  );

program
  .command('watch')
  .description('Rebuild TSX contracts on filesystem changes')
  .argument('<entry>', 'Entry TSX file')
  .option('-o, --out <file>', 'Output JSON file')
  .option('--mode <mode>', 'dev | prod', 'dev')
  .option('--watch-dir <dir>', 'directory to watch for changes')
  .action(
    async (entry: string, opts: { out?: string; mode?: 'dev' | 'prod'; watchDir?: string }) => {
      try {
        await runWatch({
          entry,
          outFile: opts.out,
          mode: opts.mode,
          watchDir: opts.watchDir,
        });
      } catch (error) {
        console.error('[bdui] watch failed:', (error as Error).message);
        process.exitCode = 1;
      }
    },
  );

program
  .command('validate')
  .description('Validate a JSON contract against the schema')
  .argument('<jsonFile>', 'Contract JSON to validate')
  .action(async (jsonFile: string) => {
    try {
      const data = JSON.parse(fs.readFileSync(path.resolve(jsonFile), 'utf8'));
      const report = validateContract(data);
      if (report.ok) {
        console.log('[bdui] contract is valid');
        return;
      }
      console.error('[bdui] contract is invalid:');
      for (const issue of report.errors) {
        const where = issue.instancePath || issue.schemaPath || '<root>';
        console.error(` - ${where}: ${issue.message ?? 'validation failed'}`);
      }
      process.exitCode = 1;
    } catch (error) {
      console.error('[bdui] validate failed:', (error as Error).message);
      process.exitCode = 1;
    }
  });

program
  .command('registry')
  .description('Run the BDUI registry HTTP server')
  .option('--port <port>', 'port to bind', '4000')
  .option('--host <host>', 'host to bind', '0.0.0.0')
  .option('--data-dir <dir>', 'directory for file-system storage (defaults to in-memory)')
  .option('--auth-token <token>', 'require Authorization: Bearer <token> for registry API')
  .option('--cors-origin <origin>', 'enable CORS for a specific origin')
  .option('--no-validate', 'disable contract validation on publish')
  .action(
    async (opts: {
      port?: string;
      host?: string;
      dataDir?: string;
      validate?: boolean;
      authToken?: string;
      corsOrigin?: string;
    }) => {
      try {
        await runRegistry({
          port: Number(opts.port ?? 4000),
          host: opts.host ?? '0.0.0.0',
          dataDir: opts.dataDir,
          validate: opts.validate,
          authToken: opts.authToken,
          corsOrigin: opts.corsOrigin,
        });
      } catch (error) {
        console.error('[bdui] registry failed:', (error as Error).message);
        process.exit(1);
      }
    },
  );

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  program.parseAsync().catch((error) => {
    console.error('[bdui] fatal:', error);
    process.exit(1);
  });
} else {
  program.parse();
}
