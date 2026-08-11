# Frontend Integration Guide for Backend APIs

This handbook outlines how a frontend application (e.g. Next.js, React, Vue) should connect to, consume, and manage data from this Express, TypeScript, Prisma, and PostgreSQL backend.

---

## 1. General Principles & API Contract

### 1.1 Base URL
All API endpoints are mounted under:
`http://localhost:5000/api` (or your deployed production URL)

### 1.2 Unified Response Payload
All successful API calls return HTTP `200 OK` or `201 Created` with a standardized structure:
```json
{
  "success": true,
  "message": "Human-readable description of the operation",
  "data": { ... } // object, array, or null
}
```

### 1.3 Error Handling Contract
When a request fails (due to invalid inputs, missing auth tokens, forbidden access, or database constraints), the API returns `4xx` or `5xx` status codes with:
```json
{
  "success": false,
  "message": "Summary of the error",
  "errorSources": [
    {
      "path": "fieldName",
      "message": "Specific error reason"
    }
  ]
}
```
> **Frontend Tip**: You can loop over `errorSources` to show inline error messages under specific form inputs (e.g. using React Hook Form's `setError`).

---

## 2. Authentication & Session Management Flow

### 2.1 User Registration (`POST /api/auth/register`)
- **When to use**: On the Sign-Up page.
- **Payload**: `{ "name": "John", "email": "john@example.com", "password": "secretpassword" }`
- **Behavior**: Creates a user in the database with the default role `CUSTOMER` and status `ACTIVE`.
- **Frontend Action**: On success, show a success toast and redirect the user to the `/login` page.

### 2.2 User Login (`POST /api/auth/login`)
- **When to use**: On the Sign-In page.
- **Payload**: `{ "email": "john@example.com", "password": "secretpassword" }`
- **Behavior**: 
  - Validates credentials, checks if user is blocked or deleted.
  - Returns `accessToken` in the JSON response body.
  - Automatically sets `refreshToken` in a secure `HttpOnly` cookie in the browser.
- **Frontend Action**:
  - Save `accessToken` in your client state store (e.g. Zustand, Redux, or React Context).
  - Save user profile info (`id`, `name`, `email`, `role`) for immediate UI rendering.

### 2.3 Setting up Axios / Fetch Client
Configure a global Axios instance (e.g. `lib/api.ts`) to automatically attach the Bearer token:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use((config) => {
  const token = getAccessTokenFromStore(); // Fetch from Zustand/Redux
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear client auth state and redirect to login page
      clearAuthState();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 3. Product Catalog & Search Integration

### 3.1 Fetching Shop Products (`GET /api/products`)
- **When to use**: Shop page, Catalog listing, Search bar, Category filters.
- **Query Parameters**:
  - `searchTerm`: Filter products by name or description.
  - `categoryId`: Filter products by specific category UUID.
  - `minPrice` / `maxPrice`: Price range slider values.
  - `sortBy` (`price`, `createdAt`, `stock`) & `sortOrder` (`asc`, `desc`).
  - `page` & `limit`: Pagination parameters.
- **Response Structure**:
  ```json
  {
    "success": true,
    "message": "Products retrieved successfully",
    "data": {
      "meta": { "page": 1, "limit": 10, "totalCount": 42, "totalPages": 5 },
      "result": [ ... ]
    }
  }
  ```
- **Frontend Action**: Render product cards using `data.result` and pagination controls using `data.meta`.

### 3.2 Product Details (`GET /api/products/:id`)
- **When to use**: Single Product Details Page (`/product/[id]`).
- **Behavior**: Returns full product specifications, category metadata, and list of customer reviews.

### 3.3 Admin Product Management
- **Create**: `POST /api/products` (Requires `ADMIN` role).
- **Update**: `PATCH /api/products/:id` (Requires `ADMIN` role).
- **Delete**: `DELETE /api/products/:id` (Soft-deletes product without breaking historical order receipts).

---

## 4. Categories Integration (`/api/categories`)

- **Public**:
  - `GET /api/categories`: Fetch all active categories. Use this to render Navbar navigation links, category badge chips, and Shop sidebar filters.
  - `GET /api/categories/:id`: Fetch single category details.
- **Admin**:
  - `POST /api/categories`, `PATCH /api/categories/:id`, `DELETE /api/categories/:id`.

---

## 5. Shopping Cart & Order Checkout Integration

### 5.1 Client Cart State
Keep transient cart items in local client state (Zustand or localStorage):
```json
[
  { "productId": "4d5e6f7g-...", "quantity": 2, "price": 899.99, "name": "Smart Phone X" }
]
```

### 5.2 Placing an Order (`POST /api/orders`)
- **When to use**: Checkout page CTA button.
- **Auth Required**: `Bearer <token>`
- **Payload**:
  ```json
  {
    "items": [
      { "productId": "4d5e6f7g-...", "quantity": 2 }
    ]
  }
  ```
- **What Backend Does**:
  1. Executes inside a **Prisma Database Transaction**.
  2. Checks if each product exists and has sufficient stock.
  3. Automatically decrements inventory stock levels and flags item as `OUT_OF_STOCK` if stock hits 0.
  4. Returns the created Order with line items and total calculation.
- **Frontend Action**: Clear client cart store, show confirmation screen, and redirect user to `/dashboard/orders`.

### 5.3 Customer Order History (`GET /api/orders/my-orders`)
- **When to use**: User Dashboard -> My Orders.
- **Behavior**: Returns all past purchases with line items, purchase price snapshots, and status progression flags (`PENDING` -> `SHIPPED` -> `DELIVERED`).

### 5.4 Admin Order Management
- `GET /api/orders`: List all orders across all customers.
- `PATCH /api/orders/:id/status`: Admin updates status (e.g. to `SHIPPED` or `CANCELLED`).
  > **Note**: Updating an order status to `CANCELLED` automatically restores product stock levels back into the product catalog on the backend.

---

## 6. Product Reviews Integration (`/api/reviews`)

- **Fetching Reviews**: `GET /api/reviews/product/:productId` (Public). Render rating stars and comments on the product page.
- **Submitting a Review**: `POST /api/reviews` (Authenticated). Accepts `{ "productId": "...", "rating": 5, "comment": "Great product!" }`.
- **Modifying / Deleting**: `PATCH /api/reviews/:id` (Author only) and `DELETE /api/reviews/:id` (Author or Admin).

---

## 7. User Profile Management (`/api/users`)

- **Get Own Profile**: `GET /api/users/me` (Authenticated). Populates User Profile settings.
- **Update Profile**: `PATCH /api/users/me` with `{ "name": "New Name" }`.
- **Admin User Management**:
  - `GET /api/users`: View all users.
  - `PATCH /api/users/:id`: Change status (`ACTIVE` vs `BLOCKED`) or role (`CUSTOMER` vs `ADMIN`).
  - `DELETE /api/users/:id`: Soft delete user account.
