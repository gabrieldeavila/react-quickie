---

name: agnostic-software-architecture 
description: Universal pipeline for building production-grade, scalable software systems (Frontend, Backend, or Full-Stack). Orchestrates domain boundaries, data flow, interface segregation, and performance optimization. Enforces fundamentals of clean architecture, SOLID principles, security, and maintainability independent of the framework.

---

# Agnostic Software Architecture

> This skill governs the UNIVERSAL SOFTWARE ARCHITECTURE. It assumes you already have a product requirement or system design and now need to architect the software from the root entry point down to the data structures. It focuses on modular encapsulation, strict boundaries (Delivery vs. Domain vs. Infrastructure), dependency inversion, and robust engineering over quick hacks, regardless of whether it's a UI or an API.

## The Pipeline

────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  REQUIREMENTS ──→ Phase 1: Domain & I/O ──→ Phase 2: Architecture      │
│                   (extract boundaries)      (pick a system pattern)    │
│                                                       │                │
│                                                       ↓                │
│                                             Phase 3: Build & Bind      │
│                                             (folders, interfaces,      │
│                                              adapters, core logic,     │
│                                              state/storage)            │
│                                                       │                │
│                                                       ↓                │
│                                             Phase 4: Verify            │
│                                             (coupling, security,       │
│                                              performance)              │
│                                                                        │
│  ✓ Each phase has a Quality Gate. Failing a gate blocks the next.      │
└────────────────────────────────────────────────────────────────────────┘
## **Phase 0: Global Application Constraints (Mandatory)**

Before generating any code, establish the global constraints that prevent a codebase from becoming a tangled mess of tightly coupled spaghetti logic.

- **The Dependency Rule (Clean Architecture)**: Inner layers (Business/Domain Logic) MUST NEVER depend on outer layers (UI, Frameworks, Databases, APIs). Outer layers depend on inner layers.
- **Separation of Concerns**: Divide the system into distinct layers:

    - *Delivery/Presentation* (Components, Controllers, CLI input)
    - *Application/Domain* (Services, Use Cases, State Management)
    - *Infrastructure* (Repositories, API Clients, LocalStorage, ORMs)
- **Strict Boundary Validation**: All incoming data (HTTP requests, user inputs, external API responses) MUST be validated at the absolute edge. Never let malformed data reach the core logic.
- **Keep I/O at the Edges**: Pure functions and core logic should not perform side effects (Network calls, DOM manipulation, DB writes). Push side effects to the boundaries of the system.

## **Phase 1: Read the Requirements**

Extract the core technical requirements. Software is fundamentally about taking inputs, mutating/evaluating state, and producing outputs.

### **→ Extract these signals**

| **Signal** | **What to look for** |

| **System Scale & Role** | Is this a heavy client-side SPA, a data-intensive backend, a background worker, or a lightweight micro-frontend/service? |

| **Data Flow & State** | Does it require complex, synchronized state management, real-time events (WebSockets/PubSub), or simple stateless Request/Response? |

| **I/O & Integrations** | What external systems does this interact with? (Databases, Third-party REST APIs, Browser APIs, Message Brokers). |

| **Security & Trust** | What are the trust boundaries? (Authentication, Role-Based Access, Input Sanitization). |

| **Performance Bottlenecks** | Are we bound by network latency, CPU (heavy computation), memory (large datasets), or UI rendering? |

### **→ Output an Architecture Extraction**

State in 2-3 lines exactly what you extracted:

*"Architecture Extraction: Data-intensive domain handling financial transactions. Requires strict validation at the boundary. Core logic must be isolated from the delivery mechanism (HTTP/UI). High risk of race conditions or state desync; requires transactional safety or strict state immutability. Infrastructure layer needs caching to prevent external API rate limits."*

### **✓ Quality Gate: Read**

Confirm:

- You have extracted the technical signals.
- You have written the Architecture Extraction summary.

## **Phase 2: Pick an Application Architecture**

Select ONE architectural pattern below based on the requirements. Commit fully.

### **Architecture A: The Modular Monolith (Rich Client / Standard API)**

*Best for: 80% of standard web apps, B2B dashboards, REST APIs.* High cohesion, relies heavily on strict module boundaries and feature-sliced design.

**Flow:**

1. **Entry Point** (App Router, Main Module, Dependency Injection setup)
2. **Feature Modules** (Self-contained slices containing their own UI/Controllers, Logic, and Data access).
3. **Shared Kernel** (Cross-domain utilities, auth handlers, base UI components).
4. **Adapter Layer** (Bridging the app with external libraries to avoid vendor lock-in).

### **Architecture B: Event-Driven / Reactive**

*Best for: Highly interactive UIs, real-time dashboards, decoupled microservices, background processing.* Focus on message passing, eventual consistency, and decoupled producers/consumers.

**Flow:**

1. **Event Bus / Broker** (Context/Zustand for UI, RabbitMQ/Kafka/Redis for Backend).
2. **Producers/Dispatchers** (UI interactions or webhooks emitting events without knowing the receiver).
3. **Consumers/Reducers** (Listening to events, updating localized state or triggering side effects).
4. **Command/Query Separation (CQRS)** (Reads are handled differently than mutations).

### **Architecture C: The Lightweight / Serverless Pipeline**

*Best for: Serverless functions, CLI tools, simple static pages, data-transformation scripts.* Linear progression, functional core, fast execution.

**Flow:**

1. **Trigger/Handler** (Extracts payload from the invoker).
2. **Sanitizer/Validator** (Strict schema validation).
3. **Pipeline Core** (Pure functions transforming data step-by-step).
4. **Output Dispatcher** (Returns response, writes to DB, or renders static HTML).

### **✓ Quality Gate: Architecture**

Confirm:

- You selected ONE architecture.
- You have mapped the specific module/component tree you will build.

## **Phase 3: Build & Bind**

### **→ Domain-Driven Folder Structure**

Organize code by the *Business Domain* (Feature), not by the technical role.

Plaintext

```
src/
 ├── core/                 # Shared Kernel (Errors, global types, utilities)
 ├── infrastructure/       # External wrappers (HTTP clients, DB configs, Third-party UI libs)
 └── modules/              # Feature-sliced domains
      └── [feature-name]/
           ├── delivery/   # UI Components OR API Controllers
           ├── domain/     # Core logic, Entities, State Management, Use Cases
           ├── data/       # Repositories, DTOs, API fetches
           └── index.ts    # Public API for this feature (Strict Encapsulation)

```

### **→ Blueprint 1: The Delivery Layer (Skinny UI/Controller)**

*Rule: The edge of the system only handles presentation or routing. It delegates work immediately.*

TypeScript

```
/* BLUEPRINT: Skinny Delivery (Works for React Component or NestJS Controller)
   WHY: Keeps the view/routing completely agnostic to business logic. */
export const UserDelivery = ({ payload, dependencies }) => {
  // 1. Extract & Validate (Props or Body)
  // 2. Delegate to Domain/Service
  const result = dependencies.userService.process(payload);
  // 3. Render or Return
  return renderOrRespond(result);
};

```

### **→ Blueprint 2: The Domain Layer (Core Logic)**

*Rule: This layer must have ZERO imports from frameworks like React, Express, or TypeORM.*

TypeScript

```
/* BLUEPRINT: Framework-Agnostic Domain Logic
   WHY: Can be tested in milliseconds without a DOM or Database. */
export class ProcessUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  execute(userData: ValidatedUserType): ResultType {
    // Pure business rules here
    if (userData.age < 18) throw new DomainError('Underage');
    return this.userRepository.save(userData);
  }
}

```

### **→ Blueprint 3: The Infrastructure Layer (Adapters)**

*Rule: Wrap third-party tools so you can mock them or swap them later.*

TypeScript

```
/* BLUEPRINT: Infrastructure Adapter
   WHY: Protects your app from changes in external APIs or libraries. */
export const FetchAdapter: IHttpClient = {
  get: async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new InfrastructureError();
    return response.json();
  }
};

```

### **✓ Quality Gate: Build**

Confirm:

- The structure follows Domain/Feature-based organization.
- Delivery logic (UI/HTTP) is strictly separated from Domain logic.
- Infrastructure (Frameworks, APIs, DBs) is hidden behind interfaces/adapters.
- No circular dependencies exist between features.

## **Phase 4: Verify**

### **Coupling & Cohesion Diff**

| **Check** | **PASS/FAIL** |

| Inner layers (Domain) have zero imports from outer layers (React, Express, DB libs) | |

| Features expose only what is necessary via an `index.ts` (Encapsulation) | |

| Third-party libraries are wrapped in adapters, not scattered across the app | |

### **Security & Resilience Diff**

| **Check** | **PASS/FAIL** |

| All inputs (Props, HTTP Body, API responses) are validated at the edge | |

| Domain errors are caught and transformed gracefully before reaching the user | |

| Async operations have clear pending, error, and success states | |

### **Performance & Scalability Diff**

| **Check** | **PASS/FAIL** |

| Expensive operations are memoized, cached, or batched | |

| State/Data is only lifted as high as necessary (no unnecessary global state) | |

| Memory leaks are prevented (Cleaning up subscriptions, intervals, listeners) | |

## **The Core Principles**

**Program to Interfaces, Not Implementations.** Whether injecting a Database repository into a backend service, or injecting a data-fetching hook into a frontend component, rely on the contract (Interface), not the hardcoded tool. This makes swapping tools and writing tests trivial.

**Inversion of Control.** High-level modules should not instantiate low-level modules. Pass dependencies (via props, context, or IoC containers) so the core application remains flexible.

**Parse, Don't Validate.** Don't just check if data is valid; parse it into a strictly typed structure at the boundary. Once data enters the Domain layer, it should be trusted implicitly.