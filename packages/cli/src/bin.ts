#!/usr/bin/env node
import { Command } from 'commander';
import { buildContract } from '@bdui/transpiler';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const program = new Command();
program.name('bdui').description('BDUI CLI').version('0.4.0');

program.command('gen')
  .description('Generate schema and DSL glue from component manifests (@bdui/defs)')
  .action(async () => {
    try {
      execSync('npm run -w packages/defs build', { stdio: 'inherit' });
      execSync('node packages/schema/scripts/generate.cjs', { stdio: 'inherit' });
      execSync('npm run -w packages/schema build', { stdio: 'inherit' });
      execSync('node packages/dsl/scripts/generate-glue.cjs', { stdio: 'inherit' });
      execSync('npm run -w packages/dsl build', { stdio: 'inherit' });
      console.log('Generation done.');
    } catch (e) {
      console.error('Generation failed:', (e as any)?.message || e);
      process.exit(1);
    }
  });

program.command('build')
  .argument('<entry>', 'Entry TSX file')
  .option('-o, --out <file>', 'Output JSON file')
  .option('--mode <mode>', 'dev | prod', 'dev')
  .action(async (entry, opts) => {
    try {
      const { json } = await buildContract({ entry, outFile: opts.out, mode: opts.mode });
      if (!opts.out) process.stdout.write(json + '\n');
    } catch (e: any) {
      console.error('Build failed:', e?.message || e);
      process.exit(1);
    }
  });

program.command('validate')
  .argument('<jsonFile>', 'Contract JSON to validate')
  .action(async (jsonFile) => {
    const { validateContract } = await import('@bdui/schema');
    const txt = fs.readFileSync(jsonFile, 'utf-8');
    const data = JSON.parse(txt);
    const res = validateContract(data);
    if (res.ok) console.log('OK');
    else { console.error('Invalid:', res.errors); process.exit(1); }
  });

program.parse();
