---
name: Backend architecture
description: "Layered backends: feature modules, skinny controllers, validated input, DI and safe data access."
starters:
  - Add a new feature module with a CRUD endpoint
  - Review this service for layering and security problems
  - Move the business logic out of this controller
---

# Backend architecture

Framework-agnostic; examples use NestJS terms. Follow the project's existing structure and framework idioms first.

## Layers

- **Controllers** route, extract the payload, delegate, and return. No business logic.
- **Services / use cases** hold the business rules, so the same logic can run from HTTP, a CLI, a cron job or a queue consumer.
- **Repositories** (or the ORM layer) do the database access.
- Never instantiate a dependency with `new`; inject it. Depend on interfaces for external providers (payments, email) so they can be mocked or swapped.

## Feature modules

- Organise by domain, not by file type: each feature holds its own controller, service, input types and data access, rather than global `controllers/` or `services/` folders.
- Export only what other modules need; import the module rather than reaching into it. Avoid circular dependencies.

## Boundaries

- Validate every input at the edge with the project's schema validation, stripping unknown fields.
- Never trust client payloads or external API responses.
- Map domain errors to HTTP errors in one place; never leak stack traces or raw database errors.
- Never return passwords or sensitive data; exclude them from serialised entities.

## Data and performance

- Wrap multi-step writes in transactions.
- Avoid N+1 queries (joins/includes or dataloaders).
- Offload slow side effects (emails, PDFs, webhooks) to queues or background jobs.
- Cache or batch calls to rate-limited external APIs.

## Security

- Protect routes with authentication guards; authorise by role or policy where needed.
- Secrets come from configuration, never from code.

## Shape

One responsibility per file. Split services that grow into several domains; keep functions short and named for what they do.
