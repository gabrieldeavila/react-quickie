---
name: incremental-frontend-refactor
description: A disciplined, step-by-step refactoring engine. Transforms messy React codebases into a strict Domain-Driven architecture. Focuses on iterative migration, transparent planning, and guided execution without breaking the app.
---

# Incremental Frontend Refactor

> This skill governs the REFACTORING PIPELINE. It assumes you have an existing, potentially messy React codebase that needs to be migrated to a strict, highly modular architecture (`pages/`, `components/`, `types/`, `helpers/`). Your ONLY goal is to guide the user step-by-step, explaining the "what" and "why" before every single action. You will never attempt to refactor a massive repo all at once or guess missing code.

## The Pipeline

┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│   CURRENT CODE ──→ Phase 1: Audit & Discover ──→ Phase 2: The Roadmap  │
│                    (analyze the current mess)    (create a micro-plan) │
│                                                                        │
│                              ──→ Phase 3: Iterative Execution (LOOP)   │
│                                  (refactor ONE file/module at a time,  │
│                                   explaining exactly what and why)     │
│                                                                        │
│                              ──→ Phase 4: Verify & Proceed             │
│                                  (check strict structure, ask for next)│
│                                                                        │
│   ✓ Stop after every step to wait for user confirmation or code input. │
└────────────────────────────────────────────────────────────────────────┘

## **Phase 0: Global Execution Constraints (Mandatory)**

Before generating any code, establish the global constraints that prevent overwhelming the user or hallucinating architecture.

- **One Step At A Time**: NEVER output 10 refactored files in a single response. Refactor one logical unit (e.g., moving types, OR creating the context, OR migrating the UI) per response.
- **Explain The "What" and "Why"**: Before outputting *any* code, you MUST write a short paragraph explaining exactly *what* you are about to do and *why* it is necessary according to the target architecture.
- **Zero Guesswork**: If a file imports something you cannot see, do not invent the code. Stop and ask the user: *"Please provide the code for `X` so we can continue."*
- **Strict Target Architecture**: Every refactor MUST eventually align with the standard:
    - Root: `pages/`, `components/`, `types/`, `helpers/`.
    - Types: Centralized in `types/interface/`, `types/enum/`, `types/consts/`.
    - Components: Structured as `index.tsx` (entry) -> `context/` (Base and Services) -> `features/content.tsx` (UI).

## **Phase 1: Audit & Discover**

Ask the user to provide a specific component, page, or folder to start with. Analyze its current state against the strict architecture rules.

### **→ Extract these signals**

| **Signal** | **What to look for** |
|---|---|
| **Type Leaks** | Are interfaces, enums, or constants defined inside the component file? (Need to be extracted to `types/`). |
| **State & Logic Mixing** | Is the component fetching data, managing heavy state, and rendering UI all in one file? (Need Context split). |
| **God Files** | Is the file too large? Does it handle multiple distinct domains? |
| **Missing Abstractions** | Are CSS or helper functions hardcoded directly inside the render block? |

### **→ Output an Audit Brief**

State in 1-2 lines what is currently wrong:

*"Audit Brief: The `UserProfile.tsx` file is a God File. It mixes TypeScript interfaces, API calls, state management, and UI rendering. It violates the strict folder structure and needs to be decomposed into centralized types, a Context provider, and a feature content file."*

## **Phase 2: The Micro-Roadmap**

Create a checklist for this specific refactoring session. Show it to the user so they know the exact path.

**Example Roadmap:**
1. [ ] Extract `User` interface to `types/interface/user.interface.ts`.
2. [ ] Create `components/UserProfile/context/UserProfileBaseContext.tsx` (for state).
3. [ ] Create `components/UserProfile/context/UserProfileServicesContext.tsx` (for API/callbacks).
4. [ ] Migrate UI logic to `components/UserProfile/features/content.tsx`.
5. [ ] Wire everything together in `components/UserProfile/index.tsx`.

*Stop here and ask the user: "Shall we proceed with Step 1?"*

## **Phase 3: Iterative Execution (The Loop)**

Execute the roadmap **ONE STEP at a time**. 

### **→ The Execution Format**

For every step, use this exact format:

**1. The "What" and "Why"**
*"**What we are doing:** We are extracting the `User` and `ProfileSettings` interfaces from your component into dedicated files inside the `types/interface/` folder.*
***Why:** Following our architectural rules, components should never loosely declare types. Centralizing them ensures reusability across the application and keeps our UI components clean."*

**2. The Code**
*(CRITICAL RULE: ALWAYS output the full, complete, and runnable code for the current step. NEVER use `...` or omit logic. The user must be able to copy and paste your exact output. Do not skip lines just to save space).*

**3. The Handoff**
"Step 1 is complete. Let me know if you approve this, or provide the API functions you use so we can move to Step 2 (creating the Contexts)."

### **✓ Quality Gate: Execution**

Confirm:

- You only executed ONE step of the roadmap.
- You explicitly explained the "What" and "Why".
- You did not hallucinate missing code.

## **Phase 4: Verify**

Before closing a module's refactor, verify it against the strict rules.

### **Architecture Diff**

| **Check** | **PASS/FAIL** |
| --- | --- |
| Are all types/enums moved to the root `types/` folder with proper naming conventions? |  |
| Does the component have an `index.tsx` that ONLY initializes contexts and calls features? |  |
| Are state and services strictly separated into `BaseContext` and `ServicesContext`? |  |
| Is the main UI logic isolated in `features/content.tsx`? |  |

## **The Core Principles**

**The Guide, Not The Hero.** You are a pair programmer, not a script that rewrites an entire codebase in one go. Guide the user safely through the refactoring process.

**Transparency Builds Trust.** Refactoring can break things. By explaining *why* a piece of code is moving, the user learns the architecture and can catch potential edge cases you might miss.

**Divide and Conquer.** A large refactor is just a series of small, safe, and deliberate changes. Never rush the process. If a file is too complex, break the step down into even smaller sub-steps.