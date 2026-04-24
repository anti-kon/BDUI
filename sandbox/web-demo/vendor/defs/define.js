/**
 * Manifest API: defines a component's name, props, children model, events,
 * aliases, and nesting rules. Manifests are pure data — they are consumed by
 * the schema generator, DSL builders, and tree-validator.
 */
export function children() {
    return {
        none() {
            return { kind: 'none' };
        },
        text(opts) {
            return { kind: 'text', ...(opts ?? {}) };
        },
        nodes(opts) {
            return { kind: 'nodes', ...(opts ?? {}) };
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
        nesting: cfg.nesting,
        since: cfg.since,
    };
}
// Typed carrier — `T` is retained only for DX (IDE auto-complete of prop names
// when authoring manifests); it is not materialised at runtime.
export function props(typeName) {
    return { typeName };
}
//# sourceMappingURL=define.js.map