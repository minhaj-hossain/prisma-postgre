# Backend Project Plan: SCIC/EJP-13 Backend REST API

This document maps out the design, database models, API specs, and the phased implementation plan for the Express, TypeScript, Prisma, and PostgreSQL backend.

---

## 1. Technology Stack
*   **Backend Framework**: Express.js with TypeScript
*   **Database**: PostgreSQL (Supabase / NeonDB / Local PostgreSQL)
*   **ORM**: Prisma Client & Prisma Migrate
*   **Authentication**: JWT (JSON Web Tokens) & Password Hashing via Bcrypt
*   **Validation**: Zod (for request validation and type safety)
*   **Config & CORS**: Dotenv (environment variable management) & CORS middleware

---

## 2. Directory Structure
We will adopt a modular architecture that keeps services, schemas, and routes separate, clean, and easily scalable.

```text
prisma-postgre/
├── prisma/
│   ├── schema.prisma        # Database schema, models, enums
│   └── migrations/          # Auto-generated database migrations
├── src/
│   ├── app.ts               # Express application initialization & middleware setup
│   ├── server.ts            # Entry point to start the server
│   ├── routes/              # HTTP Route definitions
│   │   ├── index.ts         # Base API router (combines all route files)
│   │   ├── auth.routes.ts   # Registration & login endpoints
│   │   ├── user.routes.ts   # User profile management endpoints
│   │   ├── category.routes.ts
│   │   ├── product.routes.ts
│   │   ├── review.routes.ts
│   │   └── order.routes.ts
│   ├── services/            # Core business logic and database queries
│   │   ├── user/
│   │   │   ├── user.service.ts
│   │   │   └── user.validation.ts
│   │   ├── category/
│   │   │   ├── category.service.ts
│   │   │   └── category.validation.ts
│   │   ├── product/
│   │   │   ├── product.service.ts
│   │   │   └── product.validation.ts
│   │   ├── review/
│   │   │   ├── review.service.ts
│   │   │   └── review.validation.ts
│   │   └── order/
│   │       ├── order.service.ts
│   │       └── order.validation.ts
│   ├── controllers/         # Bridges Express requests to the appropriate services
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── category.controller.ts
│   │   ├── product.controller.ts
│   │   ├── review.controller.ts
│   │   └── order.controller.ts
│   ├── middlewares/         # Global & route-specific express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   ├── lib/
│   │   └── prisma.ts        # Prisma Client singleton initialization
│   └── utils/               # Shared utilities
│       ├── catchAsync.ts    # Wrapper to remove try-catch boilerplate
│       └── sendResponse.ts  # Standardized API response constructor
├── .env                     # Local environment variables
├── package.json             # Scripts & dependencies
└── tsconfig.json            # TypeScript configuration
```

---

## 3. Database Schema Design (Prisma)
We will design a normalized relational schema with Enums, timestamps, table mapping, indexing, and soft deletes (`isDeleted`).

### Enums
1.  `UserRole` -> `ADMIN` | `CUSTOMER`
2.  `UserStatus` -> `ACTIVE` | `BLOCKED`
3.  `OrderStatus` -> `PENDING` | `SHIPPED` | `DELIVERED` | `CANCELLED`
4.  `ProductStatus` -> `DRAFT` | `ACTIVE` | `OUT_OF_STOCK`

### Models & Relationships
*   **User**: email, password, name, role (Enum), status (Enum), isDeleted, timestamps. (Mapped to `users`)
*   **Category**: name, slug, description, isDeleted, timestamps. (Mapped to `categories`)
*   **Product**: name, description, price, stock, status (Enum), categoryId, isDeleted, timestamps. (Mapped to `products`)
*   **Review**: rating, comment, userId, productId, isDeleted, timestamps. (Mapped to `reviews`)
*   **Order**: userId, totalAmount, status (Enum), isDeleted, timestamps. (Mapped to `orders`)
*   **OrderItem**: orderId, productId, quantity, price. (Mapped to `order_items`)

**Relationships:**
*   `Category` (1) ─── (N) `Product`
*   `User` (1) ─── (N) `Review` & `Order`
*   `Product` (1) ─── (N) `Review` & `OrderItem`
*   `Order` (1) ─── (N) `OrderItem`

---

## 4. API Response Standard
All APIs will respond with a standardized structure:
*   **Success Response**:
    ```json
    {
      "success": true,
      "message": "Resource action executed successfully",
      "data": {} // or []
    }
    ```
*   **Error Response**:
    ```json
    {
      "success": false,
      "message": "Detailed error message",
      "errorSources": [
        {
          "path": "fieldName",
          "message": "Validation or execution failure reason"
        }
      ]
    }
    ```

---

## 5. Phased Implementation Tasks (Step-by-Step)

### Phase 1: Initial Workspace Setup
- [ ] Create folder structure.
- [ ] Set up `package.json` with dependencies and scripts (`build`, `dev`, `start`, `prisma:studio`, etc.).
- [ ] Configure `tsconfig.json` for compilation settings.
- [ ] Construct the `.env` template with placeholders for DB URL, Ports, and Secrets.

### Phase 2: Schema Development & Migrations
- [ ] Write `schema.prisma` mapping out Enums, Models, Indexes, and Relationships.
- [ ] Connect PostgreSQL / Neon / Supabase database.
- [ ] Run `npx prisma migrate dev --name init` to sync the database.
- [ ] Setup `src/lib/prisma.ts` to initialize Prisma Client singleton.

### Phase 3: Infrastructure Setup (Utils, Middlewares, App Base)
- [ ] Build `utils/catchAsync.ts` and `utils/sendResponse.ts`.
- [ ] Create `middlewares/error.middleware.ts` for standardized error capture.
- [ ] Construct `middlewares/validate.middleware.ts` for Zod validation intercepting.
- [ ] Write `src/app.ts` registering core middlewares (cors, json, urlencoded).
- [ ] Set up `src/server.ts` to boot the application.

### Phase 4: Authentication System (Auth Service)
- [ ] Build Zod schemas for user registration and login validation.
- [ ] Develop `auth.service` with password hashing (`bcrypt`) and verification.
- [ ] Implement token utility to sign Access Token & Refresh Token (`jsonwebtoken`).
- [ ] Create `auth.middleware` to secure route access and perform role-checking (`ADMIN` vs `CUSTOMER`).
- [ ] Expose routes: `/api/auth/register` and `/api/auth/login`.

### Phase 5: Modular CRUD APIs Implementation
Each module will support soft-delete checks (`isDeleted: false` filters in GET queries, and setting `isDeleted: true` on deletion).

- [ ] **Category CRUD**:
  - `POST /api/categories` (Admin only)
  - `GET /api/categories` (Public)
  - `GET /api/categories/:id` (Public)
  - `PATCH /api/categories/:id` (Admin only)
  - `DELETE /api/categories/:id` (Admin only - Soft Delete)
- [ ] **Product CRUD**:
  - `POST /api/products` (Admin only)
  - `GET /api/products` (Public, supports query filters/search/pagination)
  - `GET /api/products/:id` (Public)
  - `PATCH /api/products/:id` (Admin only)
  - `DELETE /api/products/:id` (Admin only - Soft Delete)
- [ ] **User Profile Management**:
  - `GET /api/users` (Admin only)
  - `GET /api/users/:id` (Authenticated user profile)
  - `PATCH /api/users/:id` (Profile updating)
  - `DELETE /api/users/:id` (Soft delete profile)
- [ ] **Review CRUD**:
  - `POST /api/reviews` (Customer authenticated)
  - `GET /api/reviews/product/:productId` (Public product reviews)
  - `PATCH /api/reviews/:id` (Review author only)
  - `DELETE /api/reviews/:id` (Review author / Admin - Soft Delete)
- [ ] **Order/Booking CRUD**:
  - `POST /api/orders` (Customer checkout)
  - `GET /api/orders/my-orders` (Customer order history)
  - `GET /api/orders` (Admin view of all orders)
  - `PATCH /api/orders/:id/status` (Admin updates order status)
  - `DELETE /api/orders/:id` (Soft delete order)

### Phase 6: Testing & Interactive Studio
- [ ] Run `npx prisma studio` to populate dummy data and inspect schemas.
- [ ] Perform end-to-end API verification on login, authorization guards, and CRUD transactions.
- [ ] Document all requests, endpoints, status codes, and JSON body inputs in `api-docs.md`.
