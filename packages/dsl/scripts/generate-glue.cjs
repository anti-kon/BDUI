const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function loadManifests() {
  const defsPath = path.resolve(__dirname, '../../defs/dist/index.js');
  const defs = await import(pathToFileURL(defsPath).href);
  const list = [
    defs.TextManifest,
    defs.ButtonManifest,
    defs.RowManifest,
    defs.ColumnManifest,
  ].filter(Boolean);
  return list;
}

function js(obj) {
  return JSON.stringify(obj);
}

async function run() {
  const manifests = await loadManifests();

  const lines = [];
  lines.push(`// AUTO-GENERATED. Do not edit.`);
  lines.push(`import type { BDUIElement } from '../types';`);
  lines.push(`import { normalizeActions } from '../actions-normalize';`);
  lines.push(`import { toJsonValue } from '../expr';`);
  lines.push('');
  lines.push(`
type ChildMode = 'none' | 'text' | 'nodes';
type NodeCfg = { children: ChildMode; mapToProp?: string; aliases?: Record<string, string> };

function node<T extends BDUIElement['type']>(
  type: T,
  props: any,
  cfg: NodeCfg
): Extract<BDUIElement, { type: T }> {
  const { children, onAction, ...rest } = props ?? {};
  const cleaned: Record<string, any> = {};

  if (cfg.aliases) {
    for (const k in cfg.aliases) {
      if (Object.prototype.hasOwnProperty.call(rest, k) && rest[k] !== undefined) {
        const real = cfg.aliases[k]!;
        rest[real] = rest[k];
        delete rest[k];
      }
    }
  }

  for (const [k, v] of Object.entries(rest as Record<string, any>)) {
    if (v === undefined) continue;
    cleaned[k] = toJsonValue(v);
  }

  if (onAction !== undefined) {
    (cleaned as any).onAction = normalizeActions(onAction);
  }

  if (cfg.children === 'text') {
    if (children !== undefined) {
      cleaned[cfg.mapToProp || 'text'] = toJsonValue(children);
    }
    return { type, ...cleaned } as any;
  }

  const n: any = { type, ...cleaned };
  if (cfg.children === 'nodes' && children !== undefined) {
    n.children = Array.isArray(children) ? children.flat() : [children];
  }
  return n as Extract<BDUIElement, { type: T }>;
}
`);

  for (const m of manifests) {
    const cfg = {
      children: m.children.kind === 'none' ? 'none' : m.children.kind === 'text' ? 'text' : 'nodes',
      mapToProp: m.children.kind === 'text' ? m.children.mapToProp || 'text' : undefined,
      aliases: m.aliases || undefined,
    };
    lines.push(
      `export function ${m.type}(props: any): any { return node(${js(m.type)}, props, ${js(cfg)}); }`,
    );
  }

  const outPath = path.resolve(__dirname, '../src/generated/components.ts');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join('\n'), 'utf-8');
  console.log('Generated DSL components at', outPath);
}

run().catch((e) => {
  console.error('DSL glue generation failed:', e);
  process.exit(1);
});
