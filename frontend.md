# UrbanMarket: Next.js Frontend Architecture & Route Specification Plan

This document serves as the complete technical specification and execution blueprint for building **UrbanMarket**, a modern full-stack e-commerce frontend application built with **Next.js 14+ (App Router)**, **Tailwind CSS**, and **Zustand**, integrated with our Express, TypeScript, Prisma, and PostgreSQL REST API backend.

---

## 1. Project Overview & Tech Stack

* **Brand Name**: **UrbanMarket**
* **Repository Name**: `urbanmarket-frontend` (or `prisma-postgre-frontend`)
* **Framework**: Next.js 14+ (App Router)
* **Styling**: Tailwind CSS & Lucide React Icons
* **State Management**: Zustand (`useAuthStore` and `useCartStore` with localStorage persistence)
* **Form & Validation**: React Hook Form & Zod
* **HTTP Client**: Axios with custom interceptors (`lib/api.ts`)
* **Notifications**: React Hot Toast

---

## 2. Comprehensive Route Specification (14 Total Routes)

Here is the exact breakdown of all **14 routes** in UrbanMarket:

| # | Route Path | Page Description | Component Type | Backend Endpoint Consumed |
|---|---|---|---|---|
| **1** | `/` | **Home Page** — Banners, Featured Categories, Trending Products | **Server Component** | `GET /api/categories`, `GET /api/products` |
| **2** | `/shop` | **Shop Catalog** — Search, Category filter, Price range, Sorting, Pagination | **Client Component** | `GET /api/categories`, `GET /api/products` |
| **3** | `/product/[id]` | **Product Details** — Dynamic SEO metadata, Specs, Reviews, Add to Cart | **Server Component** | `GET /api/products/:id`, `GET /api/reviews/product/:productId` |
| **4** | `/cart` | **Shopping Cart** — Item quantity controls, Pricing summary, Checkout CTA | **Client Component** | Driven by client `useCartStore` |
| **5** | `/login` | **Sign In** — Credentials validation, JWT login handling | **Client Component** | `POST /api/auth/login` |
| **6** | `/register` | **Sign Up** — New customer registration form | **Client Component** | `POST /api/auth/register` |
| **7** | `/checkout` | **Checkout** — Shipping address form & order placement transaction | **Client Component** (Protected) | `POST /api/orders` |
| **8** | `/dashboard` | **Customer Overview** — Profile details & Name updating | **Client Component** (Protected) | `GET /api/users/me`, `PATCH /api/users/me` |
| **9** | `/dashboard/orders` | **Customer Order History** — Past purchases & Shipping status timelines | **Client Component** (Protected) | `GET /api/orders/my-orders` |
| **10** | `/dashboard/reviews` | **My Reviews** — User review manager (Edit/Delete own reviews) | **Client Component** (Protected) | `PATCH /api/reviews/:id`, `DELETE /api/reviews/:id` |
| **11** | `/admin` | **Admin Dashboard** — Statistical analytics cards (Revenue, Orders, Stock) | **Client Component** (Admin Only) | `GET /api/orders`, `GET /api/products`, `GET /api/users` |
| **12** | `/admin/products` | **Manage Products** — Product table, Add/Edit modals, Soft delete controls | **Client Component** (Admin Only) | `POST /api/products`, `PATCH /api/products/:id`, `DELETE /api/products/:id` |
| **13** | `/admin/categories` | **Manage Categories** — Category table, Add/Edit modals, Soft delete controls | **Client Component** (Admin Only) | `POST /api/categories`, `PATCH /api/categories/:id`, `DELETE /api/categories/:id` |
| **14** | `/admin/orders` | **Manage Orders** — Order status dropdown controls (Pending -> Shipped -> Delivered) | **Client Component** (Admin Only) | `GET /api/orders`, `PATCH /api/orders/:id/status`, `DELETE /api/orders/:id` |
| **15** | `/admin/users` | **Manage Users** — Registered accounts table, Block/Unblock controls, Soft delete | **Client Component** (Admin Only) | `GET /api/users`, `PATCH /api/users/:id`, `DELETE /api/users/:id` |

---

## 3. Next.js App Router Structure

```text
urbanmarket-frontend/
├── app/
│   ├── layout.tsx                # Root Layout (Navbar, Footer, ToastProvider, Zustand Hydration)
│   ├── page.tsx                  # 1. Home Page (Server Component)
│   ├── shop/
│   │   └── page.tsx              # 2. Shop Catalog (Client Component)
│   ├── product/
│   │   └── [id]/
│   │       └── page.tsx          # 3. Product Details Page (Server Component with SEO)
│   ├── cart/
│   │   └── page.tsx              # 4. Shopping Cart Page (Client Component)
│   ├── login/
│   │   └── page.tsx              # 5. Sign In Page (Client Component)
│   ├── register/
│   │   └── page.tsx              # 6. Sign Up Page (Client Component)
│   ├── checkout/
│   │   └── page.tsx              # 7. Checkout Page (Protected Client Component)
│   ├── dashboard/                # Customer Dashboard (Protected Layout)
│   │   ├── layout.tsx            # Dashboard Sidebar navigation
│   │   ├── page.tsx              # 8. Customer Profile Page
│   │   ├── orders/
│   │   │   └── page.tsx          # 9. Order History Page
│   │   └── reviews/
│   │       └── page.tsx          # 10. Customer Review Manager Page
│   └── admin/                    # Admin Dashboard (Protected Layout)
│       ├── layout.tsx            # Admin Sidebar navigation
│       ├── page.tsx              # 11. Admin Overview Page
│       ├── products/
│       │   └── page.tsx          # 12. Admin Manage Products Page
│       ├── categories/
│       │   └── page.tsx          # 13. Admin Manage Categories Page
│       ├── orders/
│       │   └── page.tsx          # 14. Admin Manage Orders Page
│       └── users/
│           └── page.tsx          # 15. Admin Manage Users Page
├── components/
│   ├── ui/                       # Atom UI (Button, Input, Card, Modal, Spinner, Badge)
│   ├── Navbar.tsx                # Dynamic Header with cart count badge & Auth dropdown
│   ├── Footer.tsx                # Global Footer
│   ├── ProductCard.tsx           # Product preview card
│   ├── FilterSidebar.tsx         # Catalog filter controls
│   └── ReviewSection.tsx         # Product reviews feed & submission form
├── lib/
│   └── api.ts                    # Central Axios client with token interceptors
├── store/
│   ├── authStore.ts              # Zustand Auth Session store
│   └── cartStore.ts              # Zustand Shopping Cart store
├── utils/
│   ├── formatCurrency.ts         # Currency formatter utility
│   └── formatDate.ts             # Date formatter utility
├── .env.local                    # NEXT_PUBLIC_API_URL=http://localhost:5000/api
├── package.json
└── tailwind.config.ts
```

---

## 4. State Management (Zustand Stores)

### 4.1 Auth Session Store (`store/authStore.ts`)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, token) => set({ user, accessToken: token }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: 'urbanmarket-auth' }
  )
);
```

### 4.2 Shopping Cart Store (`store/cartStore.ts`)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type CartState = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (newItem) => {
        const currentCart = get().cart;
        const existingIndex = currentCart.findIndex((i) => i.productId === newItem.productId);
        if (existingIndex > -1) {
          const updated = [...currentCart];
          updated[existingIndex].quantity += newItem.quantity;
          set({ cart: updated });
        } else {
          set({ cart: [...currentCart, newItem] });
        }
      },
      removeFromCart: (productId) => set({ cart: get().cart.filter((i) => i.productId !== productId) }),
      updateQuantity: (productId, quantity) => {
        set({
          cart: get().cart.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        });
      },
      clearCart: () => set({ cart: [] }),
      getTotalPrice: () => get().cart.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    { name: 'urbanmarket-cart' }
  )
);
```

---

## 5. Phased Implementation Checklist

### Phase 1: Project Initialization
```bash
npx create-next-app@latest urbanmarket-frontend --ts --tailwind --eslint --app --src-dir=false
```
- [ ] Install packages: `npm install zustand axios react-hook-form zod lucide-react react-hot-toast`.
- [ ] Configure `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`.

### Phase 2: Design System & Layout Shell
- [ ] Create UI primitives in `components/ui/` (Button, Input, Card, Modal, Spinner, Badge).
- [ ] Build global `Navbar.tsx` and `Footer.tsx` in `app/layout.tsx`.
- [ ] Configure Axios interceptor in `lib/api.ts`.

### Phase 3: Auth & Protected Routes
- [ ] Build `app/login/page.tsx` and `app/register/page.tsx`.
- [ ] Save login token and user profile into `useAuthStore`.
- [ ] Create route protection components (`ProtectedRoute` & `AdminRoute`).

### Phase 4: Product Catalog & Product Details
- [ ] Build `app/shop/page.tsx` with live query filters (`searchTerm`, `categoryId`, `minPrice`, `page`).
- [ ] Build `app/product/[id]/page.tsx` with dynamic SEO metadata and customer review list.
- [ ] Connect "Add to Cart" button to `useCartStore`.

### Phase 5: Cart, Checkout & Customer Dashboard
- [ ] Build `app/cart/page.tsx` display with subtotal calculations.
- [ ] Build `app/checkout/page.tsx` posting order items to `/api/orders`.
- [ ] Build `app/dashboard/orders/page.tsx` rendering order status progress badges.

### Phase 6: Admin Management Console
- [ ] Build `app/admin/page.tsx` metrics overview.
- [ ] Build `app/admin/products/page.tsx` with Add/Edit modals and soft-delete triggers.
- [ ] Build `app/admin/categories/page.tsx` category manager.
- [ ] Build `app/admin/orders/page.tsx` status update controls.
- [ ] Build `app/admin/users/page.tsx` user status management.
