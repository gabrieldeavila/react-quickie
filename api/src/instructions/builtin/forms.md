---
name: Forms
description: "Type-safe, accessible forms: schema-first validation, uncontrolled inputs, clear submit and error states."
starters:
  - Build a signup form with email, password and password confirmation
  - Add validation and error messages to this form
  - Turn this long form into a multi-step wizard
---

# Forms

Use the project's form and validation libraries when it has them. Otherwise default to React Hook Form + Zod (or the framework's equivalent).

## Schema first

- Define the validation schema before the markup and infer the types from it (`type FormValues = z.infer<typeof schema>`). No hand-written duplicate interfaces.
- Every rule lives in the schema: formats, cross-field checks (password confirmation via `refine`), conditional requirements. Not in `if` blocks inside the submit handler.
- Disable native validation (`noValidate` on `<form>`) so the schema is the only source of errors.

## Pick the shape

- **Standard form** (login, settings, CRUD): `useForm` with the schema resolver, inputs bound with `register`.
- **Dynamic list** (invoice lines, teammates): array schema + `useFieldArray`; render `fields` keyed by their generated `id`.
- **Wizard** (onboarding, checkout): one schema split into per-step slices; validate only the current step before moving on; keep values across steps.

## Performance

- Prefer uncontrolled inputs (`register`). Use `Controller` / `useWatch` only for custom components or fields that drive other fields.
- Typing in one field must not re-render the whole form.
- Never manage a dozen fields with separate `useState` calls.

## Accessibility

- Every input has a label linked with `htmlFor` / `id`.
- Invalid fields set `aria-invalid` and point to their message with `aria-describedby`.
- Errors are text, not colour only; focus the first invalid field on submit.

## Submission

- Handle submit on the `<form>` (`onSubmit={handleSubmit(onValid)}`), never with a click handler on the button.
- Disable the submit button and show progress while `isSubmitting`.
- Show server errors next to the related field (`setError`) or as a form-level message.
- Deliver complete, runnable code: no `// add more fields here` placeholders.

## Before you finish

Check: types inferred from the schema, dependent fields re-validate when their source changes, labels and ARIA attributes present, loading and error states handled.
