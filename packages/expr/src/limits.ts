/** Hard limits protecting the parser and interpreter from abuse. */
export interface ExprLimits {
  readonly maxSourceLength: number;
  readonly maxDepth: number;
  readonly maxNodes: number;
}

export const DEFAULT_LIMITS: ExprLimits = {
  maxSourceLength: 1024,
  maxDepth: 32,
  maxNodes: 256,
};

/** Identifiers explicitly forbidden to prevent prototype pollution. */
export const FORBIDDEN_IDENTIFIERS: readonly string[] = Object.freeze([
  '__proto__',
  'prototype',
  'constructor',
  'this',
  'globalThis',
  'window',
  'self',
  'eval',
  'Function',
]);
