# Cookie session example mono repo

This mono repository is a minimal example of session based authentication using http-only cookies.

## Using this example

You need to install Bun to run both the server and the client without additional changes.
Refer to the [Bun official documentation](https://bun.sh/guides/getting-started).

Then, run the following commands:

```sh
bun install
```

```sh
bun run dev
```

## What's inside?

This mono repo includes the following packages and apps:

### Apps and Packages

- `api`: a [Hono](https://hono.dev/top) authentication server
- `admin`: a [Vite](https://vitejs.dev/) single page React app

- `@repo/eslint-config`: ESLint configurations used throughout the monorepo
- `@repo/jest-presets`: Jest configurations
- `@repo/typescript-config`: tsconfig.json's used throughout the monorepo

Each package and app is 100% [TypeScript](https://www.typescriptlang.org/).
