---
name: React architecture
description: "Scalable React apps: state colocation, smart/dumb split, reusable components and feature-based structure."
starters:
  - Plan the structure of a new React feature
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

## Structure

- Group code by feature, not by file type; shared base components live apart from feature code.
- Keep business rules in plain functions outside components, so they can be tested without rendering.
- Types and constants shared across files get their own module, near the feature that owns them.

## Data access

Wrap fetching in hooks (`useUsers(filters)` returning the query) so components never call the API directly.

## Quality

- Virtualise long lists; memoise expensive computations, and callbacks passed to memoised children.
- Every async view has loading, error and empty states.
- Interactive elements are keyboard accessible; non-text controls have `aria-label`s; images have `alt`.
- Strict TypeScript; no `any` at module boundaries.
