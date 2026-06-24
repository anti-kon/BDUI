import type { BDUIElement } from '@bdui/core';

import type { ComponentManifest } from './define.js';
import { componentDefinitionMap } from './registry/index.js';

export interface TreeValidationIssue {
  readonly path: string;
  readonly code: string;
  readonly message: string;
}

export interface TreeValidationResult {
  readonly ok: boolean;
  readonly issues: readonly TreeValidationIssue[];
}

function pathOf(parent: string, index: number, type: string): string {
  return `${parent}/children[${index}]:${type}`;
}

export function validateTree(
  root: BDUIElement,
  manifestMap: ReadonlyMap<string, ComponentManifest> = inferManifestMap(),
): TreeValidationResult {
  const issues: TreeValidationIssue[] = [];
  visit(root, '$', [], manifestMap, issues);
  return { ok: issues.length === 0, issues };
}

function visit(
  node: BDUIElement,
  path: string,
  ancestors: readonly ComponentManifest[],
  manifestMap: ReadonlyMap<string, ComponentManifest>,
  issues: TreeValidationIssue[],
): void {
  const manifest = manifestMap.get(node.type);
  if (!manifest) {
    issues.push({
      path,
      code: 'UNKNOWN_COMPONENT',
      message: `Unknown component type "${node.type}"`,
    });
    return;
  }

  const children = (node.children ?? []) as readonly BDUIElement[];

  checkNesting(node, path, ancestors, manifest, issues);
  checkChildrenCount(node, path, manifest, children, issues);
  checkAllowedChildren(node, path, manifest, children, issues);

  const nextAncestors = [...ancestors, manifest];
  children.forEach((child, index) => {
    visit(child, pathOf(path, index, child.type), nextAncestors, manifestMap, issues);
  });
}

/** Enforce `onlyInside`/`notInside` ancestry rules from the manifest. */
function checkNesting(
  node: BDUIElement,
  path: string,
  ancestors: readonly ComponentManifest[],
  manifest: ComponentManifest,
  issues: TreeValidationIssue[],
): void {
  const nesting = manifest.nesting;
  if (nesting?.onlyInside && nesting.onlyInside.length > 0) {
    const parent = ancestors[ancestors.length - 1];
    if (!parent || !nesting.onlyInside.includes(parent.type)) {
      issues.push({
        path,
        code: 'PARENT_CONSTRAINT',
        message: `"${node.type}" may only appear directly inside ${JSON.stringify(
          nesting.onlyInside,
        )}, got "${parent?.type ?? 'root'}"`,
      });
    }
  }
  if (nesting?.notInside && nesting.notInside.length > 0) {
    for (const a of ancestors) {
      if (nesting.notInside.includes(a.type)) {
        issues.push({
          path,
          code: 'FORBIDDEN_ANCESTOR',
          message: `"${node.type}" must not appear inside "${a.type}"`,
        });
        break;
      }
    }
  }
}

/** Validate the child count against the manifest's children model. */
function checkChildrenCount(
  node: BDUIElement,
  path: string,
  manifest: ComponentManifest,
  children: readonly BDUIElement[],
  issues: TreeValidationIssue[],
): void {
  const childrenModel = manifest.children;
  switch (childrenModel.kind) {
    case 'none':
      if (children.length > 0) {
        issues.push({
          path,
          code: 'CHILDREN_NOT_ALLOWED',
          message: `"${node.type}" does not accept children`,
        });
      }
      break;

    case 'text':
      // Text-like children are mapped to a prop at build time; at runtime the
      // `children` array is expected to be empty. We only check ancestry.
      break;

    case 'nodes': {
      if (childrenModel.min != null && children.length < childrenModel.min) {
        issues.push({
          path,
          code: 'TOO_FEW_CHILDREN',
          message: `"${node.type}" expects >= ${childrenModel.min} children, got ${children.length}`,
        });
      }
      if (childrenModel.max != null && children.length > childrenModel.max) {
        issues.push({
          path,
          code: 'TOO_MANY_CHILDREN',
          message: `"${node.type}" expects <= ${childrenModel.max} children, got ${children.length}`,
        });
      }
      break;
    }

    case 'slots':
      // Slots-model children are laid out by the renderer. The tree-validator
      // does not inspect slot composition; that's the responsibility of the
      // DSL builder.
      break;
  }
}

/** Reject direct children whose type is not in the manifest whitelist. */
function checkAllowedChildren(
  node: BDUIElement,
  path: string,
  manifest: ComponentManifest,
  children: readonly BDUIElement[],
  issues: TreeValidationIssue[],
): void {
  const nesting = manifest.nesting;
  if (nesting?.allowedChildren && nesting.allowedChildren.length > 0) {
    const allowed = new Set(nesting.allowedChildren);
    children.forEach((child, index) => {
      if (!allowed.has(child.type)) {
        issues.push({
          path: pathOf(path, index, child.type),
          code: 'CHILD_TYPE_NOT_ALLOWED',
          message: `"${child.type}" is not allowed as a child of "${node.type}"`,
        });
      }
    });
  }
}

function inferManifestMap(): ReadonlyMap<string, ComponentManifest> {
  const map = new Map<string, ComponentManifest>();
  for (const [type, def] of componentDefinitionMap.entries()) {
    map.set(type, def.manifest);
  }
  return map;
}
