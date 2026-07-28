---
 name: robust-form-architect 
 description: Full-spectrum pipeline for building production-grade, type-safe forms. Orchestrates schema validation, field dependencies, accessible error handling, and performance optimization. Enforces schema-first design, uncontrolled inputs by default, and zero-fluff execution.
---

# Robust Form Architect

> This skill governs the FORM ENGINEERING PIPELINE. It assumes you are working with a developer who needs a robust form implemented. Your ONLY goal is to deliver a production-ready, strictly typed form that handles edge cases flawlessly. It focuses on schema validation (e.g., Zod), efficient state management (e.g., React Hook Form), accessibility, and assertive technical decisions.

## The Pipeline

Plaintext

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   REQUIREMENT  ──→ Phase 1: Schema & Rules ──→ Phase 2: Architecture │
│                  (extract data structure)    (pick form pattern)     │
│                                                                      │
│                              ──→ Phase 3: Execute & Bind             │
│                                  (write the schema, hooks, inputs,   │
│                                   error states, and submit logic)    │
│                                                                      │
│                              ──→ Phase 4: Verify                     │
│                                  (type inference, a11y, re-renders)  │
│                                                                      │
│   Each phase has a ✓ Quality Gate. Failing a gate blocks the next.   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

```

## **Phase 0: Global Execution Constraints (Mandatory)**

Before generating any form code, establish the global constraints that prevent forms from becoming slow, inaccessible messes.

- **The Schema-First Rule**: NEVER start by writing UI or HTML inputs. Always define the validation schema (e.g., Zod, Yup) first, infer the TypeScript types from it, and let the schema drive the form logic.
- **The Uncontrolled Default**: Prefer uncontrolled inputs (using refs, e.g., React Hook Form's `register`) to prevent entire form re-renders on every keystroke. Only use controlled inputs (`Controller` / `useWatch`) when strictly necessary for conditional logic or custom UI components.
- **Accessibility (A11y) is Mandatory**: Every input MUST have a linked label. Every error message MUST be linked to its input via `aria-invalid` and `aria-describedby`.
- **Zero Fluff Code**: Deliver the full, runnable code. Do not write `// add fields here`. Handle the loading state, the submission handler, and the error displays explicitly.

## **Phase 1: Read and Deconstruct**

Extract the exact data structure and validation rules required by the business logic.

### **→ Extract these signals**

| **Signal** | **What to look for** | | **Data Shape** | Is this a flat object, nested objects, or dynamic arrays (e.g., adding multiple items/users)? | | **Strict Validations** | Are there complex rules? (Regex, async email verification, interdependent fields like "password confirmation"). | | **Conditional Logic** | Does Field B only appear if Field A has a specific value? | | **Submission UX** | What happens on submit? Is it a multipart/form-data upload, a JSON API call, or a multi-step transition? |

### **→ Output a Form Brief**

State in 1-2 lines exactly what you are executing:

_"Form Brief: E-commerce checkout form. Requires nested objects (shipping and billing addresses) and conditional logic (billing same as shipping checkbox). Schema: Zod. State: React Hook Form. Handled edge cases: strict postal code regex and submission loading states."_

### **✓ Quality Gate: Read**

Confirm:

- You have mapped all fields and their specific validation rules.
- You know if dynamic arrays (`useFieldArray`) or dependent fields are required.

## **Phase 2: Pick an Execution Strategy**

Select ONE form architecture below based on the scope of the request.

### **Architecture A: The Standard CRUD Form**

_Best for: Login, Registration, Settings, simple data entry._ Focus on speed, clean error messaging, and immediate feedback.

**Flow:**

1. **The Schema** (Define Zod schema and infer `type FormData = z.infer<typeof schema>`).
2. **The Hook Setup** (Initialize `useForm` with the resolver).
3. **The Markup** (Standard inputs mapped to the register function with error displays).

### **Architecture B: The Dynamic Array Form**

_Best for: Invoices, adding multiple teammates, bulk edits._ Focus on array manipulation without causing massive re-renders.

**Flow:**

1. **Array Schema** (Define schema with `.array()`).
2. **Field Array Hook** (Use `useFieldArray` to get `fields, append, remove`).
3. **The List Rendering** (Map through `fields`, rendering inputs dynamically with unique `id`s).

### **Architecture C: The Multi-Step Wizard**

_Best for: Complex onboarding, long questionnaires, checkout flows._ Focus on state persistence across steps and partial validation.

**Flow:**

1. **Global Schema** (One large schema, broken into step-specific sub-schemas).
2. **Step Manager** (State to track current step, validating only the active slice before proceeding).
3. **The Wrapper** (Next/Back buttons, progress indicator).

### **✓ Quality Gate: Architecture**

Confirm:

- You selected ONE architecture.
- You are ready to output the complete Schema + UI implementation.

## **Phase 3: Execute & Formulate (The Code)**

### **→ The Formatting Rule**

Use standard markdown code blocks. Always provide the validation schema and the UI component in the same response so they can be copy-pasted together.

### **→ The "Production Form" Standard**

- Disable the submit button while `isSubmitting` is true.
- Use `onSubmit` in the `<form>` tag, NEVER attach click handlers directly to the submit button.
- Extract error messages gracefully (e.g., `<p className="text-red-500">{errors.email?.message}</p>`).

### **✓ Quality Gate: Execute**

Confirm:

- The schema exactly matches the requested fields.
- The form handles submission state (loading/disabled).
- Accessibility attributes (`id`, `htmlFor`, `aria-invalid`) are present.

## **Phase 4: Verify**

### **Robustness Diff**

| **Check** | **PASS/FAIL** | | Are the TypeScript types inferred directly from the schema (No manual interfaces)? | | | Do dependent fields update their validation status correctly? | | | Is native HTML validation disabled (`noValidate` on `<form>`) to let the schema handle it? | |

### **Assertiveness Diff**

| **Check** | **PASS/FAIL** | | Did I output code instead of explaining how form libraries work? | | | Did I assume a modern stack (React Hook Form + Zod) instead of offering outdated alternatives? | | | Is the code ready to be dropped into a production app? | |

## **The Core Principles**

**The Schema is the Single Source of Truth.** If a field exists in the UI, it must exist in the schema. If it needs validation, it goes in the schema, not in a random `if/else` block inside the submit function.

**Performance by Default.** Typing in a text input should not cause the entire form wrapper to re-render. Rely on uncontrolled inputs and isolate re-renders.

**Don't Build Your Own Form State.** Managing `e.target.value` with `useState` for 15 fields is a junior mistake. Always use a robust form library to handle touched states, dirty states, and validation caching. Provide the code that reflects this seniority.
