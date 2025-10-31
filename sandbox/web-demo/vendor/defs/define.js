export function children() {
  return {
    none() {
      return { kind: 'none' };
    },
    text(opts) {
      return { kind: 'text', ...opts };
    },
    nodes(opts) {
      return { kind: 'nodes', ...opts };
    },
    slots(slots) {
      return { kind: 'slots', slots };
    },
  };
}
export function Component(cfg) {
  return {
    type: cfg.name,
    propsTypeName: cfg.props.typeName,
    children: cfg.children ?? { kind: 'none' },
    events: cfg.events ?? [],
    aliases: cfg.aliases,
  };
}
export function props(typeName) {
  return { typeName };
}
