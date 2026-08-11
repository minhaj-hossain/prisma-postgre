# UrbanMarket Frontend Master Initial Prompt

> 💡 **How to use this file**: Copy the entire text block below and paste it as your initial prompt when initializing your new frontend project workspace or AI coding assistant.

---

```markdown
You are an expert full-stack developer tasked with building **UrbanMarket**, a premium, high-performance E-Commerce frontend client application using **Next.js 14+ (App Router)**, **Tailwind CSS**, and **Zustand**. 

This application connects to an existing, production-ready Express, TypeScript, Prisma, and PostgreSQL REST API backend running at `http://localhost:5000/api` (or deployed on Vercel).

---

### 1. Technology Stack & Key Libraries

* **Framework**: Next.js 14+ (App Router)
* **Styling**: Tailwind CSS & Lucide React Icons
* **State Management**: Zustand (`useAuthStore` for session persistence, `useCartStore` for shopping cart persistence)
* **HTTP Client**: Axios (configured with request & response interceptors and `withCredentials: true`)
* **Forms & Validation**: React Hook Form & Zod
* **Toast Notifications**: React Hot Toast

---

### 2. Complete 15-Route Specification

Please construct the following **15 routes**:

| # | Route Path | Page Description | Component Type | Connected Backend API |
|---|---|---|---|---|
| 1 | `/` | **Home Page** — Banners, Featured Categories, Trending Products | **Server Component** | `GET /api/categories`, `GET /api/products` |
| 2 | `/shop` | **Shop Catalog** — Search bar, Category filters, Price sliders, Sorting, Pagination | **Client Component** | `GET /api/categories`, `GET /api/products` |
| 3 | `/product/[id]` | **Product Details** — Dynamic SEO metadata, Specs, Reviews feed, Add to Cart | **Server Component** | `GET /api/products/:id`, `GET /api/reviews/product/:productId` |
| 4 | `/cart` | **Shopping Cart** — Quantity adjustment controls, Price breakdown, Checkout CTA | **Client Component** | Driven by client `useCartStore` |
| 5 | `/login` | **Sign In** — Credentials validation, JWT login handling | **Client Component** | `POST /api/auth/login` |
| 6 | `/register` | **Sign Up** — New customer registration form | **Client Component** | `POST /api/auth/register` |
| 7 | `/checkout` | **Checkout** — Shipping address form & order placement transaction | **Client Component** (Protected) | `POST /api/orders` |
| 8 | `/dashboard` | **Customer Overview** — Profile details & Name updating | **Client Component** (Protected) | `GET /api/users/me`, `PATCH /api/users/me` |
| 9 | `/dashboard/orders` | **Customer Order History** — Past purchases & Shipping status timelines | **Client Component** (Protected) | `GET /api/orders/my-orders` |
| 10 | `/dashboard/reviews` | **My Reviews** — Review manager (Edit/Delete own reviews) | **Client Component** (Protected) | `PATCH /api/reviews/:id`, `DELETE /api/reviews/:id` |
| 11 | `/admin` | **Admin Dashboard** — Analytics stat cards (Revenue, Orders, Products) | **Client Component** (Admin Only) | `GET /api/orders`, `GET /api/products`, `GET /api/users` |
| 12 | `/admin/products` | **Manage Products** — Product table, Add/Edit modals, Soft delete controls | **Client Component** (Admin Only) | `POST /api/products`, `PATCH /api/products/:id`, `DELETE /api/products/:id` |
| 13 | `/admin/categories` | **Manage Categories** — Category table, Add/Edit modals, Soft delete controls | **Client Component** (Admin Only) | `POST /api/categories`, `PATCH /api/categories/:id`, `DELETE /api/categories/:id` |
| 14 | `/admin/orders` | **Manage Orders** — Order status update dropdowns (Pending -> Shipped -> Delivered) | **Client Component** (Admin Only) | `GET /api/orders`, `PATCH /api/orders/:id/status`, `DELETE /api/orders/:id` |
| 15 | `/admin/users` | **Manage Users** — Accounts table, Block/Unblock controls, Soft delete | **Client Component** (Admin Only) | `GET /api/users`, `PATCH /api/users/:id`, `DELETE /api/users/:id` |

---

### 3. API Contract & Response Formatting

All API endpoints return standard JSON responses:
* **Success**: `{ "success": true, "message": "...", "data": { ... } }`
* **Error**: `{ "success": false, "message": "...", "errorSources": [ { "path": "field", "message": "reason" } ] }`

#### Central Axios Client Configuration (`lib/api.ts`):
```typescript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Required for HttpOnly refresh-token cookies
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

### 4. Key Implementation Rules

1. **State Persistence**:
   - Save user profile & JWT `accessToken` in Zustand `useAuthStore` (persisted in localStorage).
   - Save cart items `[{ productId, name, price, quantity }]` in Zustand `useCartStore` (persisted in localStorage).
2. **Order Checkout Flow**:
   - On `/checkout`, submit `items: [{ productId, quantity }]` to `POST /api/orders`. The backend handles Prisma inventory stock decrements automatically inside a database transaction.
3. **UX & Aesthetic Excellence**:
   - Use clean, modern typography (Inter/Outfit fonts), smooth hover state micro-animations, glassmorphism headers, responsive Tailwind grid systems, loading skeletons, and Toast feedback.
   - Do NOT use placeholder images; generate clean UI visuals.

Please start by setting up the project structure, base UI layout (`Navbar`, `Footer`, Toast Provider), and global Zustand stores!
```
