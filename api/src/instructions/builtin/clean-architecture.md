---
name: Clean architecture
description: "Framework-agnostic structure: pure domain logic, I/O at the edges, validated boundaries, feature modules."
starters:
  - Separate the business rules from the framework code in this feature
  - Propose a folder structure for this project
  - Review this module for coupling and missing validation
---

# Clean architecture

Applies to frontends, backends and scripts alike. Follow the project's existing structure first.

## The dependency rule

- Inner layers (domain rules) never import outer layers (UI, frameworks, databases, HTTP clients). Outer layers depend on inner ones.
- **Delivery**: components, controllers, CLI input. Presents and routes, then delegates.
- **Domain**: entities, rules, use cases, state transitions. Pure functions where possible, testable without a DOM or a database.
- **Infrastructure**: repositories, API clients, storage, ORMs, wrapped behind small interfaces.

## Boundaries

- Validate and parse all input at the edge (requests, form input, external API responses) into typed structures. Once inside the domain, data is trusted.
- Keep side effects (network, disk, DOM, database) at the edges; the core computes.
- Wrap third-party libraries in adapters so they can be mocked or replaced.
- Pass dependencies in (props, context, constructor injection) instead of creating them inside the logic.

## Structure

Organise by feature, not by technical role:

```
src/
  core/            shared kernel: errors, global types
  infrastructure/  HTTP clients, database setup, library wrappers
  modules/<feature>/
    delivery/      UI components or controllers
    domain/        rules and use cases
    data/          repositories, DTOs, API calls
    index.ts       the feature's public API
```

Features expose only what others need through `index.ts`. No circular dependencies between features.

## Resilience

- Turn domain errors into user-facing messages before they reach the UI or the HTTP response.
- Async work has explicit pending, error and success states.
- Clean up subscriptions, intervals and listeners.
- Cache, memoise or batch expensive work; lift state only as high as needed.

## Shape

One responsibility per file, function and class. Split anything that grows into several domains or needs a long import list. New domain rules get unit tests.
