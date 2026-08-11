# Next.js Frontend Architecture Plan

This document serves as the complete technical specification and execution plan for building the frontend application using **Next.js 14+ (App Router)**, **Tailwind CSS**, and **Zustand**, designed to seamlessly integrate with our Express, TypeScript, Prisma, and PostgreSQL REST API.

---

## 1. Technology Stack Selection

* **Framework**: Next.js 14+ (App Router with Server Components & Client Components)
* **Styling**: Tailwind CSS & Lucide React (Icons)
* **State Management**: Zustand (with `persist` middleware for local storage synchronization)
* **Form Management**: React Hook Form & Zod (ensures schema validation matches backend constraints)
* **HTTP Client**: Axios (configured with request & response interceptors)
* **Toast Notifications**: React Hot Toast (for smooth, non-blocking feedback)

---

## 2. Next.js App Router Structure

```text
my-frontend-app/
├── app/
│   ├── layout.tsx                # Root Layout (Navbar, Footer, ToastProvider, Zustand Hydration)
│   ├── page.tsx                  # Home Page (Server Component: Hero banner, Trending products, Featured categories)
│   ├── login/
│   │   └── page.tsx              # Login Page (Client Component: React Hook Form + Zod)
│   ├── register/
│   │   └── page.tsx              # Register Page (Client Component: React Hook Form + Zod)
│   ├── shop/
│   │   └── page.tsx              # Product Catalog (Search bar, Category filters, Price sliders, Pagination)
│   ├── product/
│   │   └── [id]/
│   │       └── page.tsx          # Product Details Page (Server Component: SEO meta tags + Review list + Add to Cart)
│   ├── cart/
│   │   └── page.tsx              # Shopping Cart (Client Component: Items list, Quantity adjustments, Summary)
│   ├── checkout/
│   │   └── page.tsx              # Checkout Page (Protected Client Component: Address input, Order placement)
│   ├── dashboard/                # Customer Dashboard (Protected Layout)
│   │   ├── layout.tsx            # Dashboard Sidebar navigation
│   │   ├── page.tsx              # Customer Overview & Profile settings
│   │   ├── orders/
│   │   │   └── page.tsx          # My Orders history & status progress timelines
│   │   └── reviews/
│   │       └── page.tsx          # My Reviews manager
│   └── admin/                    # Administrator Dashboard (Protected Layout)
│       ├── layout.tsx            # Admin Sidebar navigation
│       ├── page.tsx              # Analytics stats overview cards
│       ├── products/
│       │   └── page.tsx          # Manage Products (Add/Edit modals, Soft-delete controls)
│       ├── categories/
│       │   └── page.tsx          # Manage Categories (Add/Edit modals, Soft-delete controls)
│       ├── orders/
│       │   └── page.tsx          # Manage Customer Orders (Order status update dropdowns)
│       └── users/
│           └── page.tsx          # Manage Users (Block/Unblock controls, Soft-delete controls)
├── components/
│   ├── ui/                       # Atomic UI (Button, Input, Card, Modal, Spinner, Badge)
│   ├── Navbar.tsx                # Dynamic Header (Cart count badge & Auth state dropdown)
│   ├── Footer.tsx                # Global Footer
│   ├── ProductCard.tsx           # Reusable Product Preview Card
│   ├── FilterSidebar.tsx         # Shop page search & filter controls
│   └── ReviewSection.tsx         # Product reviews list & review submission form
├── lib/
│   └── api.ts                    # Central Axios client with interceptors
├── store/
│   ├── authStore.ts              # Session state (user profile, role, access token)
│   └── cartStore.ts              # Shopping cart state (items, quantity, price calculations)
├── utils/
│   ├── formatCurrency.ts         # Currency formatter utility
│   └── formatDate.ts             # Date formatter utility
├── .env.local                    # NEXT_PUBLIC_API_URL=http://localhost:5000/api
├── package.json
└── tailwind.config.ts
```

---

## 3. Server Components vs Client Components Strategy

### Server Components (`default`)
Use Server Components for SEO-critical, content-heavy public pages:
* **`app/page.tsx`**: Pre-renders landing banners, featured categories, and trending products.
* **`app/product/[id]/page.tsx`**: Pre-renders product specs, pricing, and initial reviews. Dynamically generates metadata tags (`generateMetadata`) for social share cards and SEO rankings.

### Client Components (`"use client"`)
Use Client Components for interactive UI segments:
* **`Navbar.tsx`**: Renders real-time cart badge counts and active user dropdowns.
* **`app/shop/page.tsx`**: Interactively updates query params (`searchTerm`, `categoryId`, `page`) and re-fetches catalog results.
* **`app/cart/page.tsx` & `app/checkout/page.tsx`**: Handles state adjustments, client validation, and checkout orders.
* **Dashboard & Admin Panels**: Interactive data tables with edit modals, status dropdowns, and soft-delete confirmation triggers.

---

## 4. State Management (Zustand Stores)

### 4.1 `authStore.ts`
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
    { name: 'auth-storage' }
  )
);
```

### 4.2 `cartStore.ts`
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
    { name: 'cart-storage' }
  )
);
```

---

## 5. Phased Frontend Implementation Checklist

### Phase 1: Next.js Initialization
- [ ] Initialize Next.js app: `npx create-next-app@latest frontend --ts --tailwind --eslint --app --src-dir=false`.
- [ ] Install packages: `npm install zustand axios react-hook-form zod lucide-react react-hot-toast`.
- [ ] Configure `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:5000/api`.

### Phase 2: Design System & Layouts
- [ ] Create UI primitives in `components/ui/` (Button, Input, Card, Modal, Spinner, Badge).
- [ ] Build global `Navbar.tsx` and `Footer.tsx` in `app/layout.tsx`.
- [ ] Setup Axios client `lib/api.ts` with token authorization header logic.

### Phase 3: Auth & Protected Routes
- [ ] Build `app/login/page.tsx` and `app/register/page.tsx` using React Hook Form + Zod.
- [ ] Wire up login response to save `user` and `accessToken` in `useAuthStore`.
- [ ] Create route protection components (`ProtectedRoute` & `AdminRoute`).

### Phase 4: Product Catalog & Details Page
- [ ] Build `app/shop/page.tsx` with dynamic query filters (`searchTerm`, `categoryId`, `minPrice`, `page`).
- [ ] Build `app/product/[id]/page.tsx` with dynamic metadata generation and review feeds.
- [ ] Connect "Add to Cart" button to `useCartStore`.

### Phase 5: Cart & Checkout Transactions
- [ ] Build `app/cart/page.tsx` displaying quantity controls and subtotal calculations.
- [ ] Build `app/checkout/page.tsx` posting order items to `/api/orders`.
- [ ] Build `app/dashboard/orders/page.tsx` listing past purchases and shipping status badges.

### Phase 6: Admin Management Console
- [ ] Build `app/admin/page.tsx` analytics overview dashboard.
- [ ] Build `app/admin/products/page.tsx` table with Add/Edit modals and soft-delete triggers.
- [ ] Build `app/admin/categories/page.tsx` category manager table.
- [ ] Build `app/admin/orders/page.tsx` status update controls.
- [ ] Build `app/admin/users/page.tsx` user account block/unblock controls.
