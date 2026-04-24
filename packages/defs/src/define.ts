/**
 * Manifest API: defines a component's name, props, children model, events,
 * aliases, and nesting rules. Manifests are pure data — they are consumed by
 * the schema generator, DSL builders, and tree-validator.
 */

export interface PropsMeta {
  readonly typeName: string;
}

export type ChildrenModel =
  | { readonly kind: 'none' }
  | { readonly kind: 'text'; readonly mapToProp?: string; readonly required?: boolean }
  | { readonly kind: 'nodes'; readonly min?: number; readonly max?: number }
  | { readonly kind: 'slots'; readonly slots: SlotsDefinition };

export type SlotDeclaration =
  | 'none'
  | 'text'
  | 'nodes'
  | { readonly kind: 'text' | 'nodes'; readonly required?: boolean };

export type SlotsDefinition = Readonly<Record<string, SlotDeclaration>>;

export type EventsDecl = readonly string[];
export type Aliases = Readonly<Record<string, string>>;

/** Structural rules used by the tree validator. */
export interface NestingRules {
  /**
   * If present, the component may only appear inside one of these parent
   * types (checked against the nearest containing component).
   */
  readonly onlyInside?: readonly string[];
  /**
   * If present, the component must NOT appear inside any of these types
   * (checked against all ancestors).
   */
  readonly notInside?: readonly string[];
  /**
   * Whitelist of allowed direct child types. If set, children whose `type`
   * is not listed are rejected.
   */
  readonly allowedChildren?: readonly string[];
}

export interface ComponentManifest {
  readonly type: string;
  readonly propsTypeName: string;
  readonly children: ChildrenModel;
  readonly events: EventsDecl;
  readonly aliases?: Aliases;
  readonly nesting?: NestingRules;
  readonly since?: string;
}

export function children(): ChildrenBuilder {
  return {
    none(): ChildrenModel {
      return { kind: 'none' };
    },
    text(opts?: { mapToProp?: string; required?: boolean }): ChildrenModel {
      return { kind: 'text', ...(opts ?? {}) };
    },
    nodes(opts?: { min?: number; max?: number }): ChildrenModel {
      return { kind: 'nodes', ...(opts ?? {}) };
    },
    slots(slots: SlotsDefinition): ChildrenModel {
      return { kind: 'slots', slots };
    },
  };
}

export interface ChildrenBuilder {
  none(): ChildrenModel;
  text(opts?: { mapToProp?: string; required?: boolean }): ChildrenModel;
  nodes(opts?: { min?: number; max?: number }): ChildrenModel;
  slots(slots: SlotsDefinition): ChildrenModel;
}

export interface ComponentConfig {
  readonly name: string;
  readonly props: PropsMeta;
  readonly children?: ChildrenModel;
  readonly events?: EventsDecl;
  readonly aliases?: Aliases;
  readonly nesting?: NestingRules;
  readonly since?: string;
}

export function Component(cfg: ComponentConfig): ComponentManifest {
  return {
    type: cfg.name,
    propsTypeName: cfg.props.typeName,
    children: cfg.children ?? { kind: 'none' },
    events: cfg.events ?? [],
    aliases: cfg.aliases,
    nesting: cfg.nesting,
    since: cfg.since,
  };
}

// Typed carrier — `T` is retained only for DX (IDE auto-complete of prop names
// when authoring manifests); it is not materialised at runtime.
export function props<T>(typeName: string): PropsMeta & { readonly __brand?: T } {
  return { typeName };
}
