---

name: nestjs-backend-architecture 

description: Full-app pipeline for building production-grade, scalable NestJS applications. Orchestrates module boundaries, dependency injection, data access, and API design. Enforces fundamentals of clean architecture, SOLID principles, security, and strict typing.
---


# NestJS Backend Application

> This skill governs the FULL NESTJS ARCHITECTURE. It assumes you already have a product requirement or system design and now need to architect the backend from the root module down to the database entities. It focuses on modular encapsulation, strict boundaries (Controllers vs. Services), data integrity, and robust engineering over quick hacks.

## The Pipeline

Plaintext

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   REQUIREMENTS ──→ Phase 1: Domain & Data  ──→ Phase 2: Architecture │
│                  (extract data flow)         (pick a system pattern) │
│                                                                      │
│                              ──→ Phase 3: Build & Bind               │
│                                  (modules, DTOs, controllers,        │
│                                   services, guards, ORM)             │
│                                                                      │
│                              ──→ Phase 4: Verify                     │
│                                  (security, testing, circular deps)  │
│                                                                      │
│   Each phase has a ✓ Quality Gate. Failing a gate blocks the next.   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

```

## **Phase 0: Global Application Constraints (Mandatory)**

Before generating any NestJS code, establish the global constraints that prevent a codebase from becoming a tangled mess of circular dependencies and fat controllers.

- **The Separation of Concerns Rule**: Controllers handle HTTP/Routing and delegate immediately. Services handle business logic. Repositories/DAOs handle database operations. Never mix these.
- **Dependency Injection Absolute**: Never instantiate a service using the `new` keyword. Always rely on the NestJS IoC container.
- **Strict Boundary Validation**: All incoming data MUST be validated at the boundary using global pipes, DTOs (Data Transfer Objects), `class-validator`, and `class-transformer`. Never trust client payloads.
- **Fail Gracefully**: Never leak raw database errors or stack traces to the client. Use Global Exception Filters to map domain errors to standardized HTTP responses.

## **Phase 1: Read the Requirements**

Extract the core technical requirements the backend needs to fulfill. A NestJS app is an orchestration of domain modules serving data securely and efficiently.

### **→ Extract these signals**

| **Signal** | **What to look for** | | **Data Relationships** | Are we dealing with complex relational data (PostgreSQL/TypeORM/Prisma) or document-based models (MongoDB/Mongoose)? | | **Sync vs. Async** | Does the flow require immediate HTTP responses, or background processing (Queues, RabbitMQ, Redis, Event Emitters)? | | **Auth & Security** | What is the authorization model? (JWT, OAuth2, Role-Based Access Control, Policy-Based)? | | **API Consumer** | Is this a RESTful JSON API, a GraphQL endpoint, or a gRPC microservice? | | **Performance Risks** | Are there heavy computations, massive database inserts, or external API rate limits that require caching/batching? |

### **→ Output an Architecture Extraction**

State in 2-3 lines exactly what you extracted:

*"Architecture Extraction: Core RESTful API for an e-commerce platform. Requires Prisma ORM with PostgreSQL. Authentication via JWT with Role-Based Access Control (RBAC). High risk of concurrency issues on inventory checkout; will require database transactions and Redis for distributed locking/caching."*

### **✓ Quality Gate: Read**

Confirm:

- You have extracted the technical signals.
- You have written the Architecture Extraction summary.

## **Phase 2: Pick an Application Architecture**

Select ONE architectural pattern below based on the requirements. Commit fully.

### **Architecture A: The Modular Monolith (Standard REST API)**

*Best for: 90% of SaaS products, traditional web apps, well-defined domains.* High cohesion, easy deployment, relies heavily on strict module boundaries.

**Flow:**

1. **AppModule** (Global configuration, Database connection, Cache)
2. **Feature Modules** (e.g., `UsersModule`, `OrdersModule`) encapsulating their own controllers and services.
3. **Shared Modules** (e.g., `AuthModule`, `MailModule`) exported for cross-domain use.
4. **Global Guards & Interceptors** (Auth verification, request logging).

### **Architecture B: The Event-Driven Microservice**

*Best for: Highly decoupled systems, heavy background processing, CQRS patterns.* Focus on message brokers, eventual consistency, and asynchronous workflows.

**Flow:**

1. **Message Broker Transport** (RabbitMQ, Kafka, or Redis Pub/Sub).
2. **Event Handlers/Consumers** (`@EventPattern` or `@MessagePattern`) replacing traditional HTTP controllers.
3. **Command/Query Separation (CQRS)** (Commands mutate state, Queries read state, often from different databases).
4. **Saga/Outbox Pattern** (Handling distributed transactions securely).

### **Architecture C: The GraphQL BFF (Backend-For-Frontend)**

*Best for: Complex clients (Mobile + Web) that need to aggregate data from multiple sources.* Focus on resolvers, Dataloaders to prevent N+1 problems, and schema generation.

**Flow:**

1. **GraphQL Module** (Code-first or Schema-first initialization).
2. **Resolvers** (Handling queries and mutations, mapping to underlying services).
3. **Dataloaders** (Batching database or microservice requests per GraphQL tick).
4. **Field-level Authorization** (Guards applied directly to GraphQL fields).

### **✓ Quality Gate: Architecture**

Confirm:

- You selected ONE architecture.
- You have mapped the specific module tree you will build.

## **Phase 3: Build & Bind**

### **→ Feature-Based Folder Structure**

Organize by domain, not by file type. Do not create global `controllers/` or `services/` folders. Everything related to a feature lives inside its module folder.

Plaintext

```
src/
 └── modules/
      └── orders/
           ├── dto/          # Data Transfer Objects (CreateOrderDto)
           ├── entities/     # DB Models / Prisma Schemas
           ├── interfaces/   # TS Interfaces/Types
           ├── orders.controller.ts
           ├── orders.service.ts
           └── orders.module.ts

```

### **→ The "Skinny Controller" Blueprint**

Controllers should only route requests, extract payloads, and return responses.

TypeScript

```
/* BLUEPRINT: Skinny Controller
   WHY: Keeps business logic testable and decoupled from HTTP. */
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User) {
    // Controller does nothing but delegate
    return this.ordersService.createOrder(createOrderDto, user.id);
  }
}

```

### **→ The strict DTO Blueprint**

Always validate at the edge using decorators.

TypeScript

```
/* BLUEPRINT: Validated DTO
   WHY: Prevents bad data from ever reaching the Service layer. */
export class CreateOrderDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

```

### **→ Module Encapsulation Blueprint**

Only export what is strictly necessary. If `OrdersModule` needs `UsersService`, `UsersModule` must export it, and `OrdersModule` must import `UsersModule`.

TypeScript

```
@Module({
  imports: [UsersModule], // Importing external domain
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService], // Only export if another module needs it
})
export class OrdersModule {}

```

### **✓ Quality Gate: Build**

Confirm:

- The project follows a domain-driven, feature-based folder structure.
- Controllers contain zero business logic.
- All request payloads are mapped to DTOs with `class-validator` decorators.
- No circular dependencies exist between modules.
- Database calls are abstracted properly (e.g., inside the Service or a Repository).

## **Phase 4: Verify**

### **Security & Data Integrity Diff**

| **Check** | **PASS/FAIL** | | Global Validation Pipe is enabled with `whitelist: true` to strip unknown properties | | | Sensitive routes are protected by Authentication Guards | | | Complex database mutations (multi-table inserts) are wrapped in Transactions | | | Passwords or sensitive PII are never returned in API responses (Entity exclusion) | |

### **Architecture & Performance Diff**

| **Check** | **PASS/FAIL** | | N+1 query problems are mitigated (using JOINs/includes or Dataloaders) | | | Heavy synchronous tasks (e.g., sending emails, generating PDFs) are offloaded to Queues | | | Services rely on injected dependencies, not hardcoded instantiations | |

## **The Core Principles**

**Fat Services, Skinny Controllers.** The HTTP layer is just a delivery mechanism. Your business logic should live entirely in Services or Domain Entities, making it easy to trigger the exact same logic via a CLI command, a Cron job, or a Message Queue without touching the controller.

**Encapsulation by Default.** Do not make everything globally available. If a module doesn't need to expose a service, keep it private. This prevents the "spaghetti graph" of dependencies as the application scales.

**Program to Interfaces, not Implementations.** When relying on external providers (e.g., Payment Gateway, Email Service), inject an abstract interface or a base class. This allows you to easily mock the provider during testing or swap Stripe for PayPal without changing your core domain logic.

Abolish God Files and God Objects. Never allow a single file, class, or component to become a centralized dumping ground for application logic. Adhere strictly to the Single Responsibility Principle (SRP). If a module requires a massive list of imports, manages multiple distinct domains, or grows exponentially in line count, it is an architectural liability. Fracture these monolithic structures into smaller, highly cohesive, and isolated units. A single file must do exactly one thing, own one responsibility, and do it well.