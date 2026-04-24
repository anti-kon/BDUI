# Changesets

This directory contains [changesets](https://github.com/changesets/changesets)
for this monorepo. Each changeset describes a release-worthy change and is
consumed by CI to version and publish the packages.

Add a changeset with:

```bash
npx changeset
```

Commit the generated markdown file alongside your change. On push to `main`,
GitHub Actions will open a versioning PR or publish to npm when that PR is
merged.

The `@bdui/*` packages are released together under a single version.
