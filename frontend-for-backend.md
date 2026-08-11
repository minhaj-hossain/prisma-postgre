# Frontend Integration Handbook for Backend APIs

This document is the definitive integration guide for frontend developers building a client application (Next.js / React) that consumes our Express, TypeScript, Prisma, and PostgreSQL backend.

---

## 1. API Architecture & Response Contracts

### 1.1 Base API Endpoint
```text
http://localhost:5000/api
```
*(In production, replace with your deployed Vercel domain: `https://your-app.vercel.app/api`)*

### 1.2 Standard Response Structure
Every successful API response returns an HTTP status code of `200 OK` or `201 Created` with a uniform JSON shape:
```json
{
  "success": true,
  "message": "Human-readable description of the operation",
  "data": { ... } // object, array, or null
}
```

### 1.3 Standard Error Response Structure
When a request fails, the API returns a `4xx` or `5xx` HTTP status code formatted as:
```json
{
  "success": false,
  "message": "Summary of the error",
  "errorSources": [
    {
      "path": "fieldName",
      "message": "Specific failure reason"
    }
  ]
}
```
> **Frontend Form Validation Tip**: If `errorSources` is present, loop over the items and map `errorSource.path` directly to input fields in your form handler (e.g., using `setError` in React Hook Form).

---

## 2. Global Axios API Client Configuration (`lib/api.ts`)

Create a centralized Axios instance configured to handle JWT tokens and HTTP-Only cookies automatically:

```typescript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Required for HttpOnly refresh-token cookies
});

// Request Interceptor: Automatically attach Access Token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle Unauthorized 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear client session and redirect to login page
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

## 3. Module-by-Module Integration Specs

### 3.1 Authentication Module (`/auth`)

#### A. User Registration (`POST /auth/register`)
* **Usage**: Sign-up Form (`app/register/page.tsx`).
* **Request Payload**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "role": "CUSTOMER" // Optional (Defaults to "CUSTOMER")
  }
  ```
* **Frontend Action**: On success (`201 Created`), toast success and navigate the user to `/login`.

#### B. User Login (`POST /auth/login`)
* **Usage**: Sign-in Form (`app/login/page.tsx`).
* **Request Payload**:
  ```json
  {
    "email": "jane@example.com",
    "password": "password123"
  }
  ```
* **Response Payload**:
  ```json
  {
    "success": true,
    "message": "User logged in successfully",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1Ni...",
      "user": {
        "id": "uuid-string",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "CUSTOMER",
        "status": "ACTIVE"
      }
    }
  }
  ```
* **Frontend Action**: Store `accessToken` and `user` in `useAuthStore` and redirect the user to `/shop` or `/dashboard`.

---

### 3.2 Product Module (`/products`)

#### A. Fetch Catalog (`GET /products`)
* **Usage**: Shop Page, Search Bar, Catalog Filters (`app/shop/page.tsx`).
* **Supported Query Parameters**:
  * `searchTerm` (`string`): Filters product `name` or `description`.
  * `categoryId` (`string`): Filters products belonging to category.
  * `minPrice` & `maxPrice` (`number`): Price boundary filters.
  * `sortBy` (`price` | `createdAt` | `stock`) & `sortOrder` (`asc` | `desc`).
  * `page` (`number`, default `1`) & `limit` (`number`, default `10`).
* **Example Axios Request**:
  ```typescript
  const { data } = await api.get('/products', {
    params: { searchTerm: 'phone', categoryId: 'uuid', minPrice: 100, page: 1, limit: 12 }
  });
  // Access items: data.data.result
  // Access pagination info: data.data.meta (page, limit, totalCount, totalPages)
  ```

#### B. Product Details (`GET /products/:id`)
* **Usage**: Single Product Details Page (`app/product/[id]/page.tsx`).
* **Behavior**: Returns product details, category name/slug, and array of active customer reviews.

#### C. Admin Product Management
* **Create**: `POST /products` (Body: `{ name, description, price, stock, categoryId, status }`). Requires `ADMIN` token.
* **Update**: `PATCH /products/:id` (Body: `{ price, stock, status }`). Requires `ADMIN` token.
* **Delete**: `DELETE /products/:id` (Soft deletes product). Requires `ADMIN` token.

---

### 3.3 Category Module (`/categories`)

* **Public**:
  * `GET /categories`: Retrieve all active categories. Use this to render Navbar dropdown menus and Shop sidebar checkboxes.
  * `GET /categories/:id`: Retrieve single category.
* **Admin Only**:
  * `POST /categories` (`{ name, slug, description }`)
  * `PATCH /categories/:id`
  * `DELETE /categories/:id`

---

### 3.4 Order & Checkout Module (`/orders`)

#### A. Checkout Order (`POST /orders`)
* **Usage**: Checkout Page (`app/checkout/page.tsx`).
* **Auth Required**: `Bearer <accessToken>`
* **Request Payload**:
  ```json
  {
    "items": [
      { "productId": "uuid-product-1", "quantity": 2 },
      { "productId": "uuid-product-2", "quantity": 1 }
    ]
  }
  ```
* **What Backend Does**:
  1. Opens a **Prisma Database Transaction**.
  2. Verifies stock availability for every product.
  3. Automatically decrements inventory stock levels. If stock reaches 0, sets status to `OUT_OF_STOCK`.
  4. Returns the created Order with item details and calculated total.
* **Frontend Action**: On success (`201 Created`), clear `useCartStore` and redirect user to `/dashboard/orders`.

#### B. Customer Order History (`GET /orders/my-orders`)
* **Usage**: Dashboard -> My Orders (`app/dashboard/orders/page.tsx`).
* **Auth Required**: `Bearer <accessToken>`
* **Behavior**: Returns list of customer's past orders with line items, prices, and status (`PENDING` -> `SHIPPED` -> `DELIVERED`).

#### C. Admin Order Control
* **Get All Orders**: `GET /orders` (Admin only).
* **Update Order Status**: `PATCH /orders/:id/status` with `{ "status": "SHIPPED" }` (Admin only).
  > **Stock Restoration Note**: Updating status to `"CANCELLED"` automatically restores product inventory back into the database.

---

### 3.5 Review Module (`/reviews`)

* **Get Product Reviews**: `GET /reviews/product/:productId` (Public).
* **Post Review**: `POST /reviews` with `{ productId, rating, comment }` (Authenticated).
* **Edit Review**: `PATCH /reviews/:id` with `{ rating, comment }` (Author only).
* **Delete Review**: `DELETE /reviews/:id` (Author or Admin).

---

### 3.6 User Management Module (`/users`)

* **Get Own Profile**: `GET /users/me` (Authenticated).
* **Update Own Profile**: `PATCH /users/me` with `{ "name": "New Name" }` (Authenticated).
* **Admin User Controls**:
  * `GET /users`: List all registered accounts.
  * `PATCH /users/:id`: Change status (`ACTIVE` | `BLOCKED`) or role (`CUSTOMER` | `ADMIN`).
  * `DELETE /users/:id`: Soft delete user account.
