# Moonfleet Guest House

Gatsby site for Moonfleet Guest House.

## Requirements

- Bun 1.3.8 or newer
- Node 22.x

Bun is the package manager and script runner for this project. Gatsby still runs
on Node because its current native dependencies do not run cleanly under Bun's
runtime.

Use the repo's Node version before running Gatsby commands:

```sh
nvm use
```

## Install

```sh
bun install
```

## Develop

```sh
bun dev
```

The local site runs at `http://localhost:8000`.

## Check

Run all checks without changing files:

```sh
bun check
```

Run checks in autofix mode:

```sh
bun check --fix
```

`bun check` verifies the Gatsby Node runtime, checks Prettier formatting, and
runs a production Gatsby build. `bun check --fix` runs Prettier in write mode
before the build.

## Format

```sh
bun run format
```

Formatting is scoped to source and config files. Generated output and caches are
ignored via `.prettierignore`.

## Build

```sh
bun run build
```

## Useful Paths

- `src/pages`: Markdown content
- `src/templates`: Gatsby page query wrappers
- `src/components/page-templates`: Shared page rendering components and CMS previews
- `static_assets`: Source images
- `webpack/fix-up-images-plugin.js`: Image optimisation pipeline
