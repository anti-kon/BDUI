# Changesets

This directory contains [changesets](https://github.com/changesets/changesets)
for this monorepo. Each changeset describes a release-worthy change and is
consumed by CI to version and publish the packages.

Add a changeset with:

```bash
npx changeset
```

Commit the generated markdown file alongside your change. The release workflow
is manual (`workflow_dispatch`) so maintainers can run it only after CI,
Android and iOS acceptance checks are green. It opens a versioning PR or
publishes to npm when `NPM_TOKEN` is configured and the version PR has been
merged.

The `@bdui/*` packages are released together under a single version.
