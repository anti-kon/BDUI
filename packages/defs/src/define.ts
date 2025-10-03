export type PropsMeta = { typeName: string };

export type ChildrenModel =
  | { kind: 'none' }
  | { kind: 'text'; mapToProp?: string; required?: boolean }
  | { kind: 'nodes'; min?: number; max?: number }
  | { kind: 'slots'; slots: Record<string, 'none' | 'text' | 'nodes' | { kind: 'text'|'nodes'; required?: boolean }> };

export type EventsDecl = string[];
export type Aliases = Record<string, string>; // aliasProp -> realProp

export type ComponentManifest = {
  type: string;
  propsTypeName: string;
  children: ChildrenModel;
  events: EventsDecl;
  aliases?: Aliases;
};

export function children() {
  return {
    none(): ChildrenModel { return { kind: 'none' }; },
    text(opts?: { mapToProp?: string; required?: boolean }): ChildrenModel { return { kind: 'text', ...opts }; },
    nodes(opts?: { min?: number; max?: number }): ChildrenModel { return { kind: 'nodes', ...opts }; },
    slots(slots: any): ChildrenModel { return { kind: 'slots', slots }; }
  };
}

export function Component(cfg: {
  name: string;
  props: PropsMeta;
  /** if omitted — children().none() */
  children?: ChildrenModel;
  events?: EventsDecl;
  aliases?: Aliases;
}): ComponentManifest {
  return {
    type: cfg.name,
    propsTypeName: cfg.props.typeName,
    children: cfg.children ?? { kind: 'none' },
    events: cfg.events ?? [],
    aliases: cfg.aliases
  };
}

export function props<T>(typeName: string): PropsMeta {
  return { typeName };
}
