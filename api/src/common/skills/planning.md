---
name: pre-execution-planner
description: Pipeline for structuring thought, defining scope, and creating execution blueprints before starting any task. Orchestrates requirement analysis, constraint mapping, and strategic sequencing to prevent rework and ensure precise delivery.
---

# Pre-Execution Planner

> This skill governs the THOUGHT STRUCTURING PIPELINE. It assumes you have received a raw idea, a problem statement, or a feature request, and you need to plan exactly *how* it will be executed before doing any actual work. Your ONLY goal is to deliver a bulletproof, logical blueprint that anticipates edge cases, defines boundaries, and establishes a clear step-by-step path. It focuses on clarity, constraint mapping, and strategic foresight over premature execution.

## The Pipeline

┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   RAW INPUT  ──→ Phase 1: Deconstruct & Scope ──→ Phase 2: Strategy  │
│                  (extract the "why" & limits)     (pick the path)    │
│                                                                      │
│                              ──→ Phase 3: Blueprint Generation       │
│                                  (write the step-by-step plan,       │
│                                   dependencies, and milestones)      │
│                                                                      │
│                              ──→ Phase 4: Verify                     │
│                                  (sanity check, risk assessment)     │
│                                                                      │
│   Each phase has a ✓ Quality Gate. Failing a gate blocks the next.   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

## **Phase 0: Global Execution Constraints (Mandatory)**

Before generating any plan, establish the global constraints that prevent disorganized execution and scope creep.

- **Measure Twice, Cut Once**: NEVER start generating final code, text, or deliverables immediately. Thinking and structuring always come first.
- **The "Why" Over The "What"**: Understand the core objective before deciding how to implement it. If the problem is poorly defined, the solution will be useless.
- **Explicit Boundaries (Scope Containment)**: Clearly define what is IN scope and, more importantly, what is OUT of scope.
- **Zero Silent Assumptions**: If a requirement is ambiguous, explicitly state the assumption you are making to move forward, or flag it as a blocker.

## **Phase 1: Read and Deconstruct**

Extract the exact problem, the constraints, and the desired outcome from the raw input.

### **→ Extract these signals**

| **Signal** | **What to look for** |
|---|---|
| **Core Objective** | What is the singular, ultimate goal of this request? (The definition of "Done"). |
| **Inputs & Outputs** | What resources/data do we have to start with? What exact format is expected at the end? |
| **Constraints** | Are there strict limits? (Time, specific technologies, character limits, performance budgets). |
| **Edge Cases & Risks** | What could go wrong? What are the unhappy paths? What happens if an input is missing? |

### **→ Output a Planning Brief**

State in 1-2 lines exactly what you are preparing to plan:

*"Planning Brief: Migration of the legacy authentication system to OAuth2.0. Requires zero downtime and backward compatibility for mobile clients. Constraints: Must use existing database schema. High risk of token invalidation during the switch."*

### **✓ Quality Gate: Read**

Confirm:
- You have identified the true root problem, not just the requested symptom.
- You have explicitly mapped out the constraints and edge cases.

## **Phase 2: Pick an Execution Strategy**

Select ONE strategic approach below based on the scope and urgency of the request.

### **Strategy A: The MVP / Linear Path**
*Best for: Quick wins, simple tasks, standard features, proof of concepts.* Focus on speed, simplicity, and delivering the core value immediately.
**Flow:**
1. Setup -> 2. Core Execution -> 3. Basic Validation -> 4. Delivery.

### **Strategy B: The Bulletproof System**
*Best for: Production-grade features, complex architecture, financial/security systems.* Focus on extreme robustness, error handling, and scalability.
**Flow:**
1. Infrastructure/Failsafes -> 2. Core Logic -> 3. Edge Case Handling -> 4. Comprehensive Testing Strategy.

### **Strategy C: The Exploratory Spike**
*Best for: Unknown technologies, vague requirements, complex debugging.* Focus on isolation, testing hypotheses, and gathering information.
**Flow:**
1. Isolate the variable -> 2. Build minimal test case -> 3. Analyze results -> 4. Propose final architecture based on findings.

### **✓ Quality Gate: Strategy**

Confirm:
- You selected ONE strategy.
- The chosen strategy matches the risk level and complexity of the user's request.

## **Phase 3: Execute & Formulate (The Blueprint)**

### **→ The Formatting Rule**
Use standard markdown. The output must be a sequential, numbered roadmap. Each step must be actionable and distinct. 

### **→ The "Actionable Blueprint" Standard**
- **Phase Breakdown**: Group steps logically (e.g., Phase 1: Setup, Phase 2: Core Logic, Phase 3: Integration).
- **Dependency Mapping**: Clearly state if Step B relies on Step A being completed first.
- **Action Verbs**: Start every step with a clear action (Create, Define, Validate, Refactor).

### **✓ Quality Gate: Blueprint**

Confirm:
- The plan is linear and logical. 
- A developer or executor could read this plan and know exactly what to do first, second, and third.
- Edge cases identified in Phase 1 are addressed in the steps.

## **Phase 4: Verify**

### **Alignment Diff**

| **Check** | **PASS/FAIL** |
|---|---|
| Does the final step of the blueprint actually achieve the Core Objective? | |
| Are all known constraints respected in the proposed steps? | |
| Is the scope contained? (No unnecessary "nice-to-haves" added secretly). | |

### **Robustness Diff**

| **Check** | **PASS/FAIL** |
|---|---|
| Are dependencies correctly ordered? (e.g., Not building the UI before the API schema). | |
| Is there a step dedicated to validation, testing, or error handling? | |
| Is the blueprint free of vague instructions like "make it work"? | |

## **The Core Principles**

**Thinking is Working.** Time spent planning is not wasted time; it is the only way to guarantee execution velocity. Rushing into implementation guarantees technical debt.

**Granularity is Clarity.** A step like "Build the backend" is useless. A step like "Define the PostgreSQL schema for the User table with UUIDs" is actionable. Break things down until they cannot be misunderstood.

**Let the Problem Dictate the Solution.** Do not force a complex architecture onto a simple problem, and do not treat a critical system like a weekend hackathon. The blueprint must reflect reality.