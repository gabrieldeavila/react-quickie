---
name: React architecture
description: "Scalable React apps: state colocation, smart/dumb split, reusable components and a strict folder structure."
starters:
  - Set up the folder structure for a new React dashboard
  - Separate the data fetching from the UI in this component
  - Review this React feature for state and re-render problems
---

# React architecture

Follow the project's existing structure and libraries first. Use the conventions below where the project has none.

## State

- Keep state as close as possible to where it is used. UI state (open/closed, active tab) doesn't go in a global store.
- Separate server state (React Query/SWR or the project's data layer) from UI state.
- Derive values during render instead of syncing them with `useEffect`.
- Put anything shareable or refresh-safe (filters, pagination, selected tab) in the URL.
- Use context instead of passing props through three or more levels.

## Components

- Containers fetch data and hold state; presentational components receive props and emit events.
- Base components (Button, Input, Card, Modal) are generic and never hardcode outer margins or widths; the parent controls layout with grid/flex.
- Prefer composition (`<Card><Card.Header/>…</Card>`) over components with many configuration props.
- One responsibility per file. Split a file when it covers several domains or keeps growing.

## Folder structure (when the project has none)

- Root: `pages/`, `components/`, `types/`, `helpers/`.
- `pages/<Page>/` holds one folder per page.
- Types, enums and constants are not declared inside components: `types/interface/<name>.interface.ts`, `types/enum/<name>.enum.ts`, `types/consts/<name>.const.ts`.
- `components/<Name>/index.tsx` sets up the contexts and renders `features/content.tsx`.
- `components/<Name>/context/`: `<Name>BaseContext` (state and values) and `<Name>ServicesContext` (callbacks and API services), with their interfaces in `types/interface/`.
- `components/<Name>/features/`: the UI, starting at `content.tsx`; CSS files only in `features/css/`.

## Data access

Wrap fetching in hooks (`useUsers(filters)` returning the query) so components never call the API directly.

## Quality

- Virtualise long lists; memoise expensive computations, and callbacks passed to memoised children.
- Every async view has loading, error and empty states.
- Interactive elements are keyboard accessible; non-text controls have `aria-label`s; images have `alt`.
- Strict TypeScript; no `any` at module boundaries.
