# Document Request Tracker

A focused document-request tracker for a single personal-injury case,
**Delgado v. Whitfield**.

The app helps a paralegal quickly see:

- What needs action
- What is in progress
- What is complete
- What is overdue

**Live:** https://andco-takehome.vercel.app

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Vitest

## Run Locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Build

```bash
pnpm build
```

The app is configured for static export and writes the production build to
`out/`.

## Test

```bash
pnpm test
pnpm lint
```

## How It Works

The app uses a local fixture:

```text
src/data/case-documents.json
```

There is no backend. User actions update local state only.

Request statuses are grouped into clear work buckets:

- **Needs you:** requires paralegal action
- **In flight:** waiting on a third party
- **Done:** completed requests
- **Draft:** not yet submitted
- **Closed:** canceled requests

Overdue is treated as a separate flag, not as its own status.

## Project Structure

```text
src/
  app/          App shell, styles, and page entry
  components/   Tracker UI and presentational components
  data/         Case document fixture
  lib/          Status mapping, selectors, derived data, and helpers
  state/        Reducer, actions, and undo handling
```

## Deployment

The site is deployed on Vercel as a static Next.js export.
