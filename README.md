# SCIC/EJP-13 E-Commerce Backend REST API

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JSON Web Tokens](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

A production-ready, scalable, and modular REST API built with **Express.js**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**. Designed to seamlessly integrate with modern frontend applications (React, Next.js).

---

## 🌟 Key Features

* **Modular Clean Architecture**: Feature-based separation across routes, controllers, services, validation schemas, and middlewares.
* **Type-Safe Validation**: Integrated **Zod** schema validations on all incoming requests (body, query, params) to guarantee strict runtime type safety.
* **Authentication & Authorization**:
  * Password hashing via **bcrypt**.
  * Access Tokens (JWT) and Refresh Tokens (stored in secure `HttpOnly` cookies).
  * Role-based authorization middleware (`ADMIN` vs `CUSTOMER`).
* **Prisma Transactions & Inventory Control**:
  * Multi-item order checkouts executed atomically using `prisma.$transaction`.
  * Automatic inventory stock decrementing and status updates (`OUT_OF_STOCK`).
  * Automatic stock restoration when an order status is updated to `CANCELLED`.
* **Advanced Product Catalog**: Supports searching (case-insensitive title/description), filtering (category, min/max price), sorting, and dynamic pagination.
* **Soft Delete Support**: `isDeleted` flag on all major models, preserving audit histories while filtering deleted records out of standard queries.
* **Unified API Payloads**: Predictable JSON response payloads (`{ success, message, data }`) and structured error outputs (`{ success, message, errorSources }`).

---

## 📁 Directory Layout

```text
prisma-postgre/
├── prisma/
│   ├── schema.prisma        # Database models (User, Category, Product, Review, Order, OrderItem) & Enums
│   └── migrations/          # Auto-generated database migrations
├── src/
│   ├── app.ts               # Express configuration, CORS, parsers, 404 handler, global error handler
│   ├── server.ts            # Server entrypoint & unhandled rejection listeners
│   ├── routes/              # Modular Express routing (auth, user, category, product, review, order)
│   ├── services/            # Business logic, Prisma database queries, and Zod validations
│   ├── controllers/         # Bridges Express requests to service actions
│   ├── middlewares/         # Global middlewares (Auth authorization, Error interceptor, Zod validator)
│   ├── lib/
│   │   └── prisma.ts        # Prisma Client singleton
│   └── utils/               # AppError, catchAsync, sendResponse helpers
├── .env                     # Environmental configuration variables
├── api-docs.md              # Complete REST API documentation
├── frontend-for-backend.md  # Frontend Integration Guide
├── frontend.md              # Next.js Frontend architecture plan
├── plan.md                  # Backend implementation plan
├── package.json             # Scripts & dependencies
└── tsconfig.json            # TypeScript configuration
```

---

## 🛠️ Technology Stack

* **Core**: Node.js, Express.js, TypeScript
* **Database & ORM**: PostgreSQL, Prisma ORM (Prisma Client & Prisma Migrate)
* **Authentication & Security**: JWT (jsonwebtoken), Bcrypt, CORS, Dotenv
* **Validation**: Zod

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: `v18+`
* **PostgreSQL**: Local PostgreSQL instance, NeonDB, or Supabase database URL.

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create or configure the `.env` file at the root directory:
```env
PORT=5000
NODE_ENV=development

# Database Connections
DATABASE_URL="postgresql://username:password@localhost:5432/scpc-backend?schema=public"
DIRECT_URL="postgresql://username:password@localhost:5432/scpc-backend?schema=public"

# JWT Secrets
JWT_ACCESS_SECRET="your_super_secret_jwt_access_key"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your_super_secret_jwt_refresh_key"
JWT_REFRESH_EXPIRES_IN="30d"

BCRYPT_SALT_ROUNDS=12
```

### 3. Database Migration
Apply migrations to your PostgreSQL database:
```bash
npx prisma migrate dev --name init
```

### 4. Run Development Server
Start the Express server with hot-reloading:
```bash
npm run dev
```
The API will be available at: `http://localhost:5000/api`

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the server in development mode using `ts-node-dev`. |
| `npm run build` | Compiles TypeScript code into clean production JavaScript in `/dist`. |
| `npm run start` | Boots the compiled production server from `/dist/server.js`. |
| `npm run prisma:generate` | Generates typings into `@prisma/client`. |
| `npm run prisma:migrate` | Runs database migrations. |
| `npm run prisma:studio` | Launches Prisma Studio GUI at `http://localhost:5555`. |

---

## 📚 Documentation Links

* [Supabase Hosting Guide (supabase.md)](file:///d:/Everything%20Else/Programming%20Hero/SCIC/prisma-postgre/supabase.md) — Supabase PostgreSQL connection strings, pooling setup, and migration steps.
* [API Documentation (api-docs.md)](file:///d:/Everything%20Else/Programming%20Hero/SCIC/prisma-postgre/api-docs.md) — Endpoint specifications, JSON request bodies, and status codes.
* [Frontend Integration Guide (frontend-for-backend.md)](file:///d:/Everything%20Else/Programming%20Hero/SCIC/prisma-postgre/frontend-for-backend.md) — Integration guide for frontend developers (Auth, Axios setup, Cart checkout, Errors).
* [Next.js Frontend Architecture Plan (frontend.md)](file:///d:/Everything%20Else/Programming%20Hero/SCIC/prisma-postgre/frontend.md) — Page views, App Router layout, and state management plan.
