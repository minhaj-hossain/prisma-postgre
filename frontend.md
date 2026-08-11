# Frontend Project Plan: Next.js E-Commerce Client Application

This document maps out the design guidelines, routing layout, state management, and step-by-step tasks to implement a premium frontend application using **Next.js (App Router)** that integrates with our Express, TypeScript, Prisma, and PostgreSQL backend.

---

## 1. Technology Stack
*   **Framework**: Next.js 14+ (App Router)
*   **Styling**: Tailwind CSS (for clean utility class styling) & Lucide React (for premium, modern icons)
*   **State Management**: Zustand (for client-side state like shopping cart, auth synchronization)
*   **Data Fetching**: Next.js Server Components (`fetch` with caching/revalidation) & Axios (client-side calls)
*   **Forms & Validation**: React Hook Form & Zod (ensures schema validation matches backend requirements)
*   **Toasts & Notifications**: React Hot Toast (for smooth, non-blocking user feedback)

---

## 2. Directory Structure (App Router)
A clean, modular organization focusing on Next.js folder-based routing, server vs client components, and service separation.

```text
frontend/
├── app/                 # Next.js App Router root
│   ├── layout.tsx       # Root Layout (Global CSS, Navbar, Footer, and Providers)
│   ├── page.tsx         # Home Page (Server Component)
│   ├── login/           # Login Page
│   │   └── page.tsx
│   ├── register/        # Registration Page
│   │   └── page.tsx
│   ├── shop/            # Shop / Product list page
│   │   └── page.tsx
│   ├── product/[id]/    # Product details page (Dynamic Route, Server Component for SEO)
│   │   └── page.tsx
│   ├── cart/            # Shopping cart page
│   │   └── page.tsx
│   ├── checkout/        # Checkout page
│   │   └── page.tsx
│   ├── dashboard/       # Protected user dashboard (Nested Layout)
│   │   ├── layout.tsx   # Dashboard Sidebar & Layout
│   │   ├── page.tsx     # Dashboard Overview / profile
│   │   ├── orders/      # User order history
│   │   │   └── page.tsx
│   │   └── reviews/     # User review manager
│   │       └── page.tsx
│   └── admin/           # Protected admin dashboard (Nested Layout)
│       ├── layout.tsx   # Admin Layout (Sidebar navigation)
│       ├── page.tsx     # Admin dashboard home / stats
│       ├── products/    # Manage products table (Add/Edit/Soft-Delete)
│       │   └── page.tsx
│       ├── categories/  # Manage categories table
│       │   └── page.tsx
│       └── orders/      # Manage customer orders
│           └── page.tsx
├── components/          # Reusable UI components
│   ├── ui/              # Atom UI components (Button, Input, Card, Modal, Loader)
│   ├── Navbar.tsx       # Global Header (Client Component for interactive login/cart state)
│   ├── Footer.tsx       # Global Footer
│   ├── ProductCard.tsx  # Product card preview component
│   └── ReviewList.tsx   # List of product reviews
├── hooks/               # Custom React hooks (useAuth, useCart, etc.)
├── lib/                 # Shared client libs
│   └── api.ts           # Axios client configuration with request/response interceptors
├── store/               # Zustand state configurations
│   ├── authStore.ts     # Current session, user info, roles
│   └── cartStore.ts     # Shopping cart items, counts, calculations
├── utils/               # Utility helpers (formatCurrency, formatDate)
├── public/              # Static assets (images, icons, etc.)
├── .env.local           # Local environment variables (NEXT_PUBLIC_API_URL)
├── package.json         # NPM scripts and packages
├── tailwind.config.ts   # Tailwind style overrides
├── tsconfig.json        # TypeScript configuration
└── next.config.mjs      # Next.js compiler and domain image caching configuration
```

---

## 3. Server vs Client Component Strategy
To achieve high performance, fast load times, and excellent SEO:
*   **Server Components (Default)**:
    *   **Home Page (`app/page.tsx`)**: Fetch trending products and categories directly on the server.
    *   **Product Details (`app/product/[id]/page.tsx`)**: Pre-render individual product details and active reviews on the server. Generate dynamic metadata tags (Title, Description, OpenGraph) for SEO ranking.
*   **Client Components (`"use client"`)**:
    *   **Cart & Checkout (`app/cart/` & `app/checkout/`)**: Interactive pages relying heavily on client side state (Zustand cart, form submissions, and browser storage).
    *   **Dashboard & Admin panels**: Control panels requiring user interaction, real-time table pagination, status dropdown updates, and modal toggles.
    *   **Navbar**: Subcomponents like the search input and cart items badge.

---

## 4. API & Auth Integration
*   **Session Management**: Save JWT token in browser cookies. Next.js server components can read cookies on initial load to determine authentication status and render UI server-side.
*   **Axios Client (`lib/api.ts`)**:
    *   **Request Interceptor**: Appends the cookie-based JWT to the headers of outgoing API queries.
    *   **Response Interceptor**: Intercepts `401 Unauthorized` responses and redirects the browser back to `/login`.

---

## 5. Phased Implementation Tasks (Step-by-Step)

### Phase 1: Setup & Tailwind configuration
- [ ] Initialize Next.js app (`npx -y create-next-app@latest frontend --ts --tailwind --eslint --app --src-dir=false`).
- [ ] Install required modules (`zustand`, `axios`, `react-hook-form`, `zod`, `lucide-react`, `react-hot-toast`).
- [ ] Setup folder structure (e.g. `/components`, `/store`, `/lib`, `/hooks`).
- [ ] Configure `next.config.mjs` (e.g. allowing external domains for product images).

### Phase 2: Shell Layout & Shared UI Components
- [ ] Establish base UI styles, colors, and font systems in `app/globals.css`.
- [ ] Create core UI parts: Buttons, Inputs, Cards, Badges, Loaders.
- [ ] Build global `Navbar` and `Footer` inside `app/layout.tsx`.
- [ ] Structure the main layout elements (Auth vs main application views).

### Phase 3: Route Setup & Server Fetching
- [ ] Build the landing home view using server components to fetch featured items.
- [ ] Build `/shop` including sorting and filtration sidebars (mix of server/client).
- [ ] Setup `/product/[id]` fetching static data, configuring SEO meta tags, and displaying reviews.

### Phase 4: Zustand Stores & Auth flow
- [ ] Create Zustand `cartStore` and sync it with localStorage.
- [ ] Create Zustand `authStore` to hold active user profile details.
- [ ] Develop `/login` and `/register` views with client validation.
- [ ] Implement Next.js routing protection middleware / context guards.

### Phase 5: Client Dashboard & Checkout
- [ ] Implement `/cart` showing totals, items list, and adjustments.
- [ ] Design the checkout interface `/checkout`.
- [ ] Build `/dashboard/orders` to list past purchases and order-shipping state timelines.

### Phase 6: Admin Administration Panel
- [ ] Implement `/admin` showing analytical totals and charts.
- [ ] Build dynamic interactive tables for `/admin/products` and `/admin/categories` to edit/soft-delete entries.
- [ ] Design the `/admin/orders` portal to inspect customer orders and change shipment status flags.
