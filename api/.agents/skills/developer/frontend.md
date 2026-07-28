---
name: react-frontend-architecture 
description: Full-app pipeline for building production-grade, scalable React applications. Orchestrates component hierarchy, state management, routing, and performance optimization. Enforces fundamentals of clean architecture, accessibility, modularity, strict typing, and feature-based organization.
---

# React Frontend Application

> This skill governs the FULL REACT ARCHITECTURE. It assumes you already have a product requirement or UI design and now need to architect the application from the root provider down to the leaf components. It focuses on state colocation, render performance, reusable systems, robust engineering, and clean folder structures over visual fluff.

## The Pipeline

┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   REQUIREMENTS ──→ Phase 1: Domain & State ──→ Phase 2: Architecture │
│                  (extract data flow)         (pick an app pattern)   │
│                                                                      │
│                              ──→ Phase 3: Build & Bind               │
│                                  (folders, context, components,      │
│                                   hooks, state, API calls)           │
│                                                                      │
│                              ──→ Phase 4: Verify                     │
│                                  (render diff, a11y, strict mode)    │
│                                                                      │
│   Each phase has a ✓ Quality Gate. Failing a gate blocks the next.   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

## **Phase 0: Global Application Constraints (Mandatory)**

Before generating any React code, establish the global constraints that prevent a codebase from becoming a tangled mess of prop-drilling and spaghetti state.

- **The State Colocation Rule**: State must live as close to where it is used as possible. Do not put UI state (like modal open/close) in a global store (Zustand/Redux) unless absolutely necessary.
- **The "Smart/Dumb" Boundary**: Separate business logic from UI. Container components fetch data and manage state; Presentational components (dumb) only receive props and emit events.
- **The Component Ecosystem**:

    - Buttons, Inputs, Cards, and Modals MUST be generic and highly reusable.
    - Never hardcode margins or widths into atomic components. Control layout from the parent container (using CSS Grid/Flexbox).

## **Phase 1: Read the Requirements**

Extract the core technical requirements the application needs to fulfill. A React app is a state machine mapped to a UI.

### **→ Extract these signals**

| **Signal** | **What to look for** | | **State Complexity** | Is this heavily interactive (needs Zustand/Context) or just fetching and displaying (needs React Query/SWR)? | | **Routing Needs** | Are there nested layouts, protected routes, or deep linking requirements (React Router / Next.js app router)? | | **Form Heaviness** | Does it need complex validation schemes (React Hook Form + Zod/Yup) or just simple controlled inputs? | | **Component Count** | How many distinct UI modules (e.g., Sidebar -> Data Table -> Slide-over Panel -> Complex Filters)? | | **Performance Risks** | Are there massive lists (needs virtualization), heavy re-renders, or large media assets? |

### **→ Output an Architecture Extraction**

State in 2-3 lines exactly what you extracted:

*"Architecture Extraction: Data-heavy B2B dashboard. Requires React Query for server state and a lightweight Context for user session. Forms require React Hook Form + Zod. Layout relies on a persistent sidebar with nested routing. High risk of table re-renders; will need virtualization and memoization."*

### **✓ Quality Gate: Read**

Confirm:

- You have extracted the technical signals.
- You have written the Architecture Extraction summary.

## **Phase 2: Pick an Application Architecture**

Select ONE architectural pattern below based on the requirements. Commit fully.

### **Architecture A: The Data-Heavy SPA (Dashboard/Admin)**

*Best for: B2B SaaS, internal tools, analytics platforms.* High data density, complex client-side state, heavy focus on tables, charts, and forms.

**Flow:**

1. **Root Providers** (Auth, Theme, Query Client)
2. **Persistent App Shell** (Sidebar, Header, User Menu)
3. **Smart Page Containers** (Handles data fetching, loading states, error boundaries)
4. **Data Grids/Tables** (Virtualization, pagination, filtering)
5. **Slide-overs/Modals** (For CRUD operations without losing context)

### **Architecture B: The E-Commerce / Catalog (Asset & SEO Heavy)**

*Best for: Storefronts, directories, content platforms.* Focus on fast First Contentful Paint, image optimization, caching, and cart/session state.

**Flow:**

1. **Root Providers** (Cart Context, UI Toast/Notifications)
2. **Global Navigation** (Mega-menus, sticky search bars)
3. **Grid/List Layouts** (Responsive product grids with skeleton loaders)
4. **Complex Filters** (URL-driven state so filters can be shared/bookmarked)
5. **Checkout Flow** (Multi-step forms with strict validation)

### **Architecture C: The Lightweight Interactive Feature**

*Best for: Single-page calculators, onboarding flows, interactive wizards.* Linear state progression. Needs rock-solid local state and smooth transition logic, but no heavy server sync.

**Flow:**

1. **Root Container** (Manages the step/wizard state)
2. **Progress Indicator** (Visual feedback based on current step)
3. **Step Components** (Isolated logic per step, validates before allowing "Next")
4. **Summary/Results** (Calculates final output based on accumulated state)

### **✓ Quality Gate: Architecture**

Confirm:

- You selected ONE architecture.
- You have mapped the specific component tree you will build.

## **Phase 3: Build & Bind**

### **→ Feature-Based Folder Structure**

Organize your codebase by feature domains rather than purely by file type. Group components, hooks, types, and API calls related to a specific feature (e.g., `features/authentication`, `features/dashboard`) together. Reserve global `components/`, `hooks/`, and `utils/` folders only for truly agnostic, app-wide infrastructure (like UI primitives or generic formatters).

### **→ Component Composition & Context (The "Glue")**

Avoid passing props down through multiple layers of components that don't need them (prop drilling). If a piece of state, a configuration object, or a callback is required deep in the tree by multiple components, **prefer using React Context** to provide them directly to the leaf components. For layout relationships, use composition (`children` prop) to keep intermediate layers clean.

TypeScript

```
/* BLUEPRINT: Context for Deep Trees
   WHY: Prevents prop drilling through intermediate components. */
export const TableRow = () => {
  // Good: Consuming context directly instead of accepting props from <TableBody>
  const { onRowClick, selectionMode } = useTableContext();
  return <tr onClick={onRowClick} className={selectionMode ? 'hover:bg-gray-50' : ''} />;
};

```

### **→ State & Data Blueprint**

Never mix server state (API data) with UI state (toggles, tabs).

TypeScript

```
/* BLUEPRINT: Custom Hook for Server State
   WHY: Abstracts fetching logic from the UI component. */
export const useUsers = (filters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000,
  });
};

```

### **→ The Reusable UI Blueprint**

Build UI components using a strict interface. (Assuming Tailwind CSS here).

TypeScript

```
/* BLUEPRINT: Atomic Button
   WHY: Ensures consistency. Never hardcode margins here. */
export const Button = ({ variant = 'primary', isLoading, children, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:ring-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200"
  };
  
  return (
    <button className={`${baseClasses} ${variants[variant]}`} disabled={isLoading} {...props}>
      {isLoading ? <Spinner /> : children}
    </button>
  );
};

```

### **✓ Quality Gate: Build**

Confirm:

- The project follows a feature-based folder structure.
- Context is utilized appropriately to avoid deeply nested prop drilling.
- Components are properly typed with TypeScript interfaces.
- Server state and Client state are strictly separated.
- No `useEffect` is being used to sync two pieces of client state (derive it instead).

## **Phase 4: Verify**

### **Render & State Diff**

| **Check** | **PASS/FAIL** | | Derived state is calculated during render, not synced via `useEffect` | | | Shared complex state relies on Context instead of 3+ levels of prop drilling | | | Large lists or heavy computations are wrapped in virtualization or `useMemo` | | | Callback functions passed to memoized children use `useCallback` | |

### **Resilience & Accessibility (a11y) Diff**

| **Check** | **PASS/FAIL** | | All interactive elements are keyboard accessible (tabindex, enter/space) | | | Asynchronous operations have clear loading and error/fallback states | | | `alt` tags and `aria-labels` are present on non-text critical UI | |

### **Architecture Consistency Diff**

| **Check** | **PASS/FAIL** | | Component files export a single primary component | | | Magic strings/numbers are extracted to constants | | | URL state is used for anything that a user might want to share/refresh (filters, pagination) | |

## **The Core Principles**

**Context Over Prop Drilling.** If a component only accepts a prop to pass it down to a child, you are prop drilling. Use React Context to teleport shared state, layout configurations, or global callbacks directly to the components that consume them, keeping your intermediate components completely clean and agnostic.

**Derive, Don't Sync.** If a value can be computed from existing state or props, do not put it in a new `useState`. Calculate it on the fly.

**Composition Over Configuration.** Don't build a `<Card/>` that takes 15 props (`title`, `subtitle`, `icon`, `footerText`). Build a `<Card>` that accepts `<Card.Header>`, `<Card.Body>`, and `<Card.Footer>` as children.

**Module Over Page.** Build agnostic hooks and components. The "Page" is just an orchestration of these independent, reusable modules.