# AGENTS.md

## Project overview

This repository is a **fullstack real-estate website in Next.js App Router** for **Marcílio Barbosa**, a local real-estate broker operating mainly in **Corumbá-MS** and **Ladário-MS**.

The site is **not** a SaaS, marketplace, or proptech startup product. It must feel like a **trustworthy local brokerage website** focused on:

- property showcase
- WhatsApp conversion
- local SEO
- low-friction browsing
- editorial/premium presentation without excess complexity

Business scope includes:

- house sales
- house rentals
- land/lot sales
- apartments
- rural land / small rural properties
- occasional commercial opportunities
- occasional special business sales, such as a store, market, or building-material business

The frontend architecture and UX direction are already defined by the applied plans. Preserve them unless the user explicitly asks for a redesign. The project already assumes:

- **Next.js App Router**
- **Server Components by default**
- **SSR-first pages** for listings, property details, and institutional content
- **Client Components only where actually needed**
- **typed domain models**
- **isolated data/service layer**
- **simple, direct UX** optimized for real users, especially mobile users
- **premium/editorial visual refinement** without copying external references literally

This guidance aligns with the applied frontend architecture and the later visual refinement plan. fileciteturn2file0 fileciteturn2file1

---

## Operating mode for coding agents

When working in this repository, follow these rules:

1. **Do not reinvent the product.** Extend the current architecture instead of replacing it.
2. **Do not turn the site into a highly interactive SPA.** Prefer server-rendered flows.
3. **Do not introduce complexity casually.** No global state, no over-engineered abstractions, no unnecessary indirection.
4. **Do not silently rewrite major folders or patterns.** Respect the current project shape.
5. **Always prefer maintainability over novelty.**
6. **Always explain tradeoffs when changing data, routing, storage, or rendering behavior.**
7. **When implementing backend features, keep the public frontend stable.**
8. **Preserve SEO and WhatsApp conversion behavior.**
9. **If a task touches architecture, propose the smallest valid change first.**
10. **Before coding, inspect the existing repository and adapt to what is already there.**

---

## Product and brand context

### Brand

- Main broker: **Marcilio Barbosa**
- Regional context: **Corumbá-MS** and **Ladário-MS**
- Tone: **direct, trustworthy, local, professional**
- Visual direction: **clean, premium/editorial, image-forward**
- Primary conversion: **WhatsApp contact**

### What the product is

A local brokerage website that must:

- present listings clearly
- surface special opportunities
- rank well in local SEO
- make it easy to contact the broker
- be simple for non-technical visitors

### What the product is not

- not a dashboard-heavy SaaS
- not a lead-funnel gimmick site
- not a generic real-estate portal like a giant marketplace
- not a place for flashy animations or trendy complexity

---

## Technical baseline

Assume the repository is or should be organized around these principles.

### Frontend principles

- Use **Server Components by default**
- Use **Client Components only for genuine client interactivity**, such as:
  - gallery behavior
  - mobile menu
  - interactive filters
  - small UI-only state
- Prefer **searchParams** over client-side state for filtering/navigation
- Keep pages SEO-friendly and fast

### Backend principles

The backend lives **inside the same Next.js project**.

That means:

- no separate external API project
- backend logic should live in server-side code within the repo
- favor:
  - `app/api/...` route handlers where HTTP endpoints are needed
  - server-side service/repository functions for internal reads/writes
  - server-only utilities for sensitive logic
  - server actions only when they are the right fit for UI-bound mutations

### Data/storage stack

Planned backend stack:

- **PostgreSQL** for relational data
- **MinIO** for media storage, using **S3-compatible patterns**

When implementing storage or media logic:

- treat MinIO as S3-compatible object storage
- keep upload/delete/list logic isolated behind service functions
- never spread storage SDK calls throughout UI components
- store only stable media metadata in the database
- keep generated object keys deterministic and collision-safe

---

## Architectural rules

### 1. Keep a clean domain model

Property data should remain strongly typed and centered around shared domain types.

Typical entities may include:

- Property
- PropertyImage
- PropertyTag
- PropertyCategory
- City
- Neighborhood
- Lead/Contact inquiry
- Broker/Profile
- MediaAsset

If new entities are introduced, define them deliberately and keep them near the domain layer.

### 2. Keep the service layer as the contract

UI components and route handlers should not directly talk to the database or object storage unless that is already the established local pattern.

Prefer a structure like:

- `src/data/services/*` or `src/server/services/*`
- `src/data/repositories/*` or `src/server/repositories/*`
- `src/lib/*` for pure utilities
- `src/types/*` for shared types

The exact folder names should match the existing repo. Do not rename everything unless explicitly requested.

### 3. Separate responsibilities clearly

- **components**: rendering only
- **sections/features**: page composition
- **services**: business/domain operations
- **repositories/db layer**: persistence
- **storage layer**: MinIO/S3 operations
- **lib/utils**: pure helper functions
- **types**: shared contracts

### 4. Preserve SSR-first architecture

Listing pages, detail pages, institutional pages, metadata generation, sitemap generation, and SEO-sensitive routes should stay server-first. This is a foundational project rule from the applied frontend plan. fileciteturn2file0

### 5. Protect route simplicity

Keep routes clean and semantic. Avoid route explosions or deep nesting for every filter combination.

Good patterns:

- `/`
- `/imoveis`
- `/imoveis/[categoria]`
- `/imovel/[slug]`
- `/sobre`
- `/contato`

Filtering refinements should generally remain query-based unless the user requests a stronger SEO landing structure.

---

## Backend guidance

## Goal

Build backend capabilities that support the public site and a future/admin workflow **without breaking the server-first frontend architecture**.

## Priorities

Implement backend work in roughly this order unless the user asks otherwise:

1. shared types and validation
2. database schema
3. storage/media abstraction
4. read-side services for public pages
5. mutations for admin/internal use
6. upload workflows
7. caching/revalidation
8. auth/admin protections if needed later

---

## Database guidance (PostgreSQL)

Use PostgreSQL as the source of truth for business data.

### Core data concerns

At minimum, design the schema to support:

- properties
- property images/media
- listing purpose (sale/rental)
- listing type (house, apartment, land, rural, commercial)
- city and neighborhood
- status (available, reserved, sold, rented, draft, archived)
- featured / special opportunity flags
- pricing
- display order / priority
- SEO-friendly slug uniqueness
- timestamps

### Recommended modeling direction

A reasonable shape is:

- `properties`
- `property_images`
- optionally `property_tags`
- optionally `property_contacts` / `leads`
- optionally `users` if admin/auth appears later

### Data integrity rules

- slugs must be unique
- property status must be explicit
- purpose/type/city should use constrained enums or controlled values
- image rows should reference property rows by foreign key
- avoid storing large derived blobs in the database
- use server-side validation for all writes

### Migrations

If migrations are introduced:

- keep them explicit and reviewable
- do not generate schema churn casually
- do not rename tables/columns without strong reason
- document destructive changes before applying them

---

## Storage guidance (MinIO)

Use MinIO for media storage in an S3-compatible way.

### Media rules

- original media files live in MinIO
- metadata lives in PostgreSQL
- UI should only consume normalized media URLs/metadata from services
- object keys should be deterministic and grouped, for example:
  - `properties/{propertyId}/cover/...`
  - `properties/{propertyId}/gallery/...`
  - `brokers/{brokerId}/avatar/...`

### Upload workflow expectations

When implementing uploads:

1. validate file type and size on the server
2. generate stable object keys
3. upload to MinIO through an isolated storage service
4. persist metadata in PostgreSQL
5. return normalized media objects to the caller
6. revalidate affected routes

### Do not

- call MinIO directly from client components
- expose raw internal credentials to the browser
- spread bucket/key logic across many files
- mix storage concerns into presentational components

### Nice-to-have patterns

- centralized `storage.ts` or `minio.ts`
- helper for public URL generation
- helper for deletion and cleanup
- optional image variants later, but only if needed

---

## Validation and safety

Every mutation path should validate input.

If a validation library is already present, follow the existing project choice.
If none exists and validation is needed, prefer a small, well-scoped solution rather than ad-hoc unchecked parsing.

Validate at least:

- title
- slug
- purpose
- type
- city
- price
- dimensions/areas
- image metadata
- contact payloads

For uploads, validate:

- mime type
- size
- count limit
- association target

---

## Caching and revalidation

Because this project is SSR-first, agents should think about cache invalidation whenever backend mutations are added.

When data changes, consider:

- `revalidatePath('/')`
- `revalidatePath('/imoveis')`
- `revalidatePath('/imoveis/[categoria]')` equivalents
- `revalidatePath('/imovel/[slug]')`
- sitemap or metadata implications if slugs change

Do not add speculative caching complexity before there is a real bottleneck.

---

## SEO and public rendering constraints

Backend changes must preserve:

- `generateMetadata` support
- OG image/title/description continuity
- clean slugs
- stable public URLs
- sitemap correctness
- local SEO pages for Corumbá and Ladário

This is important because the applied plan explicitly relies on dynamic metadata, sitemap/robots generation, and public page rendering strategy. fileciteturn2file0

---

## Visual and frontend refinement constraints

Backend changes must not accidentally degrade the refined presentation direction.

Keep supporting a frontend that expects:

- stronger visual hierarchy in hero/filter area
- better card presentation with stronger image/price/title hierarchy
- premium treatment for special opportunities
- better category/city discovery sections
- consistent design tokens and accessibility polish

These refinements were already planned and should remain compatible with future data/backend work. fileciteturn2file1

---

## Preferred implementation style

When writing code in this repository:

- prefer small, explicit functions
- prefer readable names over clever abstraction
- prefer boring patterns that scale
- prefer server-only files for secrets and storage access
- prefer narrow DTOs/return types when exposing data to UI
- prefer incremental change sets
- prefer updating existing patterns over introducing parallel ones

---

## What to avoid

Avoid these unless explicitly requested:

- Redux, Zustand, MobX, or global client state for listing flows
- a separate backend service project
- GraphQL
- over-abstracted repository/service factory layers
- event-driven architecture for simple CRUD problems
- premature background job systems
- giant generic “CMS engine” abstractions
- storing business logic inside React components
- introducing multiple ORMs or multiple storage layers
- client-side direct uploads without a deliberate secure server design

---

## Suggested folder intent

Adapt to the existing repo, but keep this mental model:

```txt
src/
  app/
    api/
    imoveis/
    imovel/
    sobre/
    contato/
  components/
  features/
  data/
    services/
    repositories/
    mocks/
  server/
    db/
    storage/
    auth/
  lib/
  types/
```

Notes:

- `data/services` should remain the public read/write contract used by the app layer
- `server/db` should contain DB-specific code
- `server/storage` should contain MinIO/S3-specific code
- `mocks` should be removable later without forcing component rewrites

---

## Task execution expectations for agents

When asked to implement something:

1. inspect the current codebase first
2. identify the existing architectural pattern already in use
3. explain the minimum necessary change
4. implement in the narrowest scope possible
5. preserve typings and route behavior
6. preserve SSR/SEO behavior
7. note any migration, env, or operational requirement

When asked to plan something:

- be concrete
- anchor the plan in the current project shape
- include tradeoffs
- separate v1 from later enhancements

When asked to modify backend behavior:

- mention affected routes
- mention affected types
- mention affected data contracts
- mention whether route revalidation is needed
- mention whether MinIO object lifecycle is affected

---

## Environment expectations

Expect environment variables along these lines when backend/media work starts:

```env
DATABASE_URL=
MINIO_ENDPOINT=
MINIO_PORT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=
MINIO_USE_SSL=
NEXT_PUBLIC_SITE_URL=
```

Do not hardcode credentials.
Do not expose server secrets to client bundles.

---

## Quality bar

Any serious backend or storage contribution should leave the repo in a state where:

- types still make sense
- public pages still render server-side correctly
- metadata still works
- media flow is isolated and understandable
- database writes are validated
- object storage usage is centralized
- changes are easy to review

---

## Default mindset

If uncertain, choose the option that is:

- simpler
- more local to the existing architecture
- more server-first
- more SEO-safe
- more maintainable
- easier for the project owner to keep evolving manually later

