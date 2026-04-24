# @bdui/defs

Component manifests for BDUI. Each manifest captures:

- the component name (`Text`, `Button`, `Column`, …),
- its TypeScript props interface,
- child-handling rules (`text`, `nodes`, none, …),
- alias props (`value → text`),
- supported events (`onAction`, `onChange`, …),
- a default web renderer (DOM).

The schema generator (`@bdui/schema`) and the DSL glue generator
(`@bdui/dsl/scripts/generate-glue.cjs`) both read from this package, so
adding a component is a one-file change.

## Components shipped today

`Column`, `Row`, `Text`, `Button`, `Input`, `Checkbox`, `Select`, `Image`,
`Divider`, `If`.

Every component comes with:

- a strongly-typed props interface in `TypeScript`,
- a web renderer implementing the `WebComponentRenderer` contract,
- tests covering the tree-validator rules.

## Tree validator

`validateTree(node)` walks a rendered contract and ensures:

- every component type is registered,
- the nesting rules defined by each manifest are honoured,
- there are no dangling references.
