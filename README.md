# Document Request Tracker — Andco take-home

One screen for a single personal-injury case (*Delgado v. Whitfield*) that lets a
paralegal answer three questions at a glance: **what's done, what's stuck, and
what needs me right now?**

**Live:** https://andco-takehome.vercel.app
&nbsp;·&nbsp; React 19 · Next.js 16 (App Router, static export) · TypeScript (strict) · Tailwind v4

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:3000

pnpm build        # static export → ./out
npx serve out     # preview the production build
```

No backend — actions mutate local state only. The fixture
(`src/data/case-documents.json`) is reshaped once at load.

## The idea: think in states, not screens

The brief weights this heavily, so the spine of the app is a **state taxonomy**,
not a layout. Nine raw statuses collapse into five action-buckets
(`src/lib/bucket.ts`); every component branches on the bucket, never on the raw
status (which survives only as a label).

| Bucket | Raw statuses | Meaning |
|---|---|---|
| **Needs you** | `needs_action`, `rejected`, `on_hold` | the next move is **ours** → pinned zone |
| **In flight** | `requested`, `in_progress`, `partially_received` | waiting on the third party |
| **Done** | `received` | complete |
| **Draft** | `draft` | not yet submitted |
| **Closed** | `canceled` | dead; hidden behind a toggle |

`Overdue` is an orthogonal **flag**, not a bucket: six items are overdue, but four
of them aren't "blocked on us" — so a flat overdue sort would bury the wrong
things. It surfaces in the overview strip and on the due cell only, never by
recoloring the whole row.

## Decisions I was most deliberate about

1. **`on_hold` belongs in "Needs you."** The brief's three "blocked on us"
   examples — *missing signature / unpaid fee / rejection* — map exactly onto
   `req_003 / req_009 / req_008`. The $35 prepayment is on us, so the pinned zone
   is precisely those three cards. *Tradeoff:* a derived bucket layer adds
   indirection over branching on raw status, but it's the only way the triage cut
   stays honest.
2. **Design tokens live in one place — Tailwind v4's `@theme`.** That block in
   `globals.css` *is* the "tokens in one place" the brief asks for; v4 generates
   the utilities, and typed lookup maps (`src/lib/tokens.ts`) bind classes to
   buckets exhaustively. *Tradeoff:* utility-class verbosity in JSX, in exchange
   for a single source of truth and zero hex outside the token file.
3. **One client island + `useReducer`, undo via snapshot.** The app is fully
   interactive with no server data, so a single `'use client'` boundary
   (`Tracker.tsx`) owning all state reads as better judgment than splitting every
   leaf into server/"connected" wrappers. Undo captures the prior value of just
   the touched request before each mutation — simpler and more honest than
   inverse-ops. *Tradeoff:* less server-rendered surface than an RSC-purist build.
4. **On-brand, restrained visuals.** Warm paper (not white), Geist for the whole
   data surface, one warm accent for needs-you/overdue moments, and otherwise
   low-chroma glass and hairlines. The hard part of a dense list is keeping it
   calm: raw status labels are visible, and status still works by glyph **and**
   color.

## What I'd do next / what I cut

- **Cut:** the real draft-submission / new-request flow, dark mode, and keyboard
  nav beyond the drawer's focus trap. Drafts stay visible and noteable, but I
  avoid pretending a draft can be followed up with a source before submission.
- **Next:** with a backend, the fixture import becomes a fetch and the modeled
  `loading` state becomes a real Suspense boundary; a server/presentational RSC
  split if the tree grows; an "assigned to me" lens (the data has two paralegals);
  the full draft-creation flow.

## Where I used AI (and steered it)

Built with Claude (Claude Code). Planning fanned out **four parallel "design
lens" agents** — state model, component/token architecture, visual system, and
the Next-16 static-export/deploy path (which read the bundled `next/dist/docs`,
since this Next.js differs from training data). I reconciled their divergences and
wrote the implementation.

Where I steered it: overrode the agents' instinct to give `on_hold` its own
"parked" bucket (the brief's "unpaid fee" makes it needs-you); collapsed a
proposed server/client connected-wrapper architecture into one client island;
corrected the overview's overdue semantics after seeing the first render (total
overdue is its own chip, not a suffix on "In flight"); and kept `next/image`
configured as unoptimized so static export remains host-agnostic.

Rough token total: **~2–3M**, the bulk in the parallel design-research agents.

## Architecture

```
src/
  app/         layout.tsx (fonts) · globals.css (@theme tokens) · page.tsx → <Tracker/>
  components/  Tracker.tsx ('use client', owns the reducer) + presentational pieces
  lib/         types · bucket · derive · selectors · reshape · relativeTime · tokens · fixture
  state/       actions · reducer (immutable patch + snapshot undo)
```

Pure functions do the thinking (`derive.ts`, `selectors.ts`); the reducer owns
mutation + a bounded undo stack; one client component composes the view-state
machine (loading / empty / ready).

## Deploy

`output: 'export'` produces a host-agnostic static site in `out/`, deployed to
**Vercel** (https://andco-takehome.vercel.app) — chosen over GitHub Pages because
the repo is private. `next.config.ts` keeps `basePath` env-driven, so the same
build runs at `/` locally and on Vercel, or under a repo subpath if it ever moves
to Pages.
