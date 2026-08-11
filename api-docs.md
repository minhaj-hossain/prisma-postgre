# E-Commerce REST API Documentation

This document describes all the REST endpoints exposed by this application.

*   **Base URL**: `http://localhost:5000/api`
*   **Response Format**: All successful responses return `200` or `201` status codes. Errors return standard `4xx` or `5xx` JSON codes.

---

## 1. Authentication (`/auth`)

### 1.1 User Registration
*   **Method**: `POST`
*   **Route**: `/auth/register`
*   **Auth Required**: None
*   **Request Body**:
    ```json
    {
      "name": "John Doe",
      "email": "johndoe@example.com",
      "password": "securepassword123",
      "role": "CUSTOMER" // Optional (Defaults to CUSTOMER. Can also be ADMIN)
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "data": {
        "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "name": "John Doe",
        "email": "johndoe@example.com",
        "role": "CUSTOMER",
        "status": "ACTIVE",
        "isDeleted": false,
        "createdAt": "2026-08-11T12:00:00.000Z",
        "updatedAt": "2026-08-11T12:00:00.000Z"
      }
    }
    ```

### 1.2 User Login
*   **Method**: `POST`
*   **Route**: `/auth/login`
*   **Auth Required**: None
*   **Request Body**:
    ```json
    {
      "email": "johndoe@example.com",
      "password": "securepassword123"
    }
    ```
*   **Response (200 OK)**:
    *   *Note: Sets an HttpOnly cookie named `refreshToken` in the browser response headers.*
    ```json
    {
      "success": true,
      "message": "User logged in successfully",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
          "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
          "name": "John Doe",
          "email": "johndoe@example.com",
          "role": "CUSTOMER",
          "status": "ACTIVE"
        }
      }
    }
    ```

---

## 2. Categories (`/categories`)

### 2.1 Get All Categories
*   **Method**: `GET`
*   **Route**: `/categories`
*   **Auth Required**: None
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Categories retrieved successfully",
      "data": [
        {
          "id": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
          "name": "Electronics",
          "slug": "electronics",
          "description": "Smartphones, Laptops, Accessories",
          "isDeleted": false,
          "createdAt": "2026-08-11T12:00:00.000Z",
          "updatedAt": "2026-08-11T12:00:00.000Z"
        }
      ]
    }
    ```

### 2.2 Get Category by ID
*   **Method**: `GET`
*   **Route**: `/categories/:id`
*   **Auth Required**: None
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Category retrieved successfully",
      "data": {
        "id": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
        "name": "Electronics",
        "slug": "electronics",
        "description": "Smartphones, Laptops, Accessories",
        "isDeleted": false,
        "createdAt": "2026-08-11T12:00:00.000Z",
        "updatedAt": "2026-08-11T12:00:00.000Z"
      }
    }
    ```

### 2.3 Create Category
*   **Method**: `POST`
*   **Route**: `/categories`
*   **Auth Required**: Yes (`Bearer <token>` - Role: `ADMIN` only)
*   **Request Body**:
    ```json
    {
      "name": "Home Appliances",
      "slug": "home-appliances",
      "description": "Refrigerators, Microwaves, Washing Machines"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Category created successfully",
      "data": {
        "id": "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
        "name": "Home Appliances",
        "slug": "home-appliances",
        "description": "Refrigerators, Microwaves, Washing Machines",
        "isDeleted": false,
        "createdAt": "2026-08-11T12:05:00.000Z",
        "updatedAt": "2026-08-11T12:05:00.000Z"
      }
    }
    ```

### 2.4 Update Category
*   **Method**: `PATCH`
*   **Route**: `/categories/:id`
*   **Auth Required**: Yes (`Bearer <token>` - Role: `ADMIN` only)
*   **Request Body**:
    ```json
    {
      "description": "Updated descriptions of kitchen devices"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Category updated successfully",
      "data": {
        "id": "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
        "name": "Home Appliances",
        "slug": "home-appliances",
        "description": "Updated descriptions of kitchen devices",
        "isDeleted": false,
        "createdAt": "2026-08-11T12:05:00.000Z",
        "updatedAt": "2026-08-11T12:10:00.000Z"
      }
    }
    ```

### 2.5 Delete Category (Soft Delete)
*   **Method**: `DELETE`
*   **Route**: `/categories/:id`
*   **Auth Required**: Yes (`Bearer <token>` - Role: `ADMIN` only)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Category deleted successfully",
      "data": null
    }
    ```

---

## 3. Products (`/products`)

### 3.1 Get All Products
*   **Method**: `GET`
*   **Route**: `/products`
*   **Query Parameters**:
    *   `searchTerm`: matches word in name/description
    *   `categoryId`: filter by category UUID
    *   `minPrice`: decimal
    *   `maxPrice`: decimal
    *   `sortBy`: fields like `price`, `createdAt`, `stock` (Defaults to `createdAt`)
    *   `sortOrder`: `asc` or `desc` (Defaults to `desc`)
    *   `page`: integer (Defaults to `1`)
    *   `limit`: integer (Defaults to `10`)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Products retrieved successfully",
      "data": {
        "meta": {
          "page": 1,
          "limit": 10,
          "totalCount": 1,
          "totalPages": 1
        },
        "result": [
          {
            "id": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
            "name": "Smart Phone X",
            "description": "High-end flagship mobile device",
            "price": 999.99,
            "stock": 50,
            "status": "ACTIVE",
            "categoryId": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
            "isDeleted": false,
            "createdAt": "2026-08-11T12:00:00.000Z",
            "updatedAt": "2026-08-11T12:00:00.000Z",
            "category": {
              "id": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
              "name": "Electronics",
              "slug": "electronics"
            }
          }
        ]
      }
    }
    ```

### 3.2 Get Product by ID
*   **Method**: `GET`
*   **Route**: `/products/:id`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Product retrieved successfully",
      "data": {
        "id": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
        "name": "Smart Phone X",
        "description": "High-end flagship mobile device",
        "price": 999.99,
        "stock": 50,
        "status": "ACTIVE",
        "categoryId": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
        "isDeleted": false,
        "createdAt": "2026-08-11T12:00:00.000Z",
        "updatedAt": "2026-08-11T12:00:00.000Z",
        "category": {
          "id": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
          "name": "Electronics",
          "slug": "electronics"
        },
        "reviews": []
      }
    }
    ```

### 3.3 Create Product
*   **Method**: `POST`
*   **Route**: `/products`
*   **Auth Required**: Yes (`Bearer <token>` - Role: `ADMIN` only)
*   **Request Body**:
    ```json
    {
      "name": "Smart Phone X",
      "description": "High-end flagship mobile device",
      "price": 999.99,
      "stock": 50,
      "categoryId": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
      "status": "ACTIVE" // Optional: "DRAFT" | "ACTIVE" | "OUT_OF_STOCK"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Product created successfully",
      "data": {
        "id": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
        "name": "Smart Phone X",
        "description": "High-end flagship mobile device",
        "price": 999.99,
        "stock": 50,
        "status": "ACTIVE",
        "categoryId": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
        "isDeleted": false,
        "createdAt": "2026-08-11T12:15:00.000Z",
        "updatedAt": "2026-08-11T12:15:00.000Z",
        "category": {
          "id": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
          "name": "Electronics",
          "slug": "electronics",
          "description": "Smartphones, Laptops, Accessories",
          "isDeleted": false,
          "createdAt": "2026-08-11T12:00:00.000Z",
          "updatedAt": "2026-08-11T12:00:00.000Z"
        }
      }
    }
    ```

### 3.4 Update Product
*   **Method**: `PATCH`
*   **Route**: `/products/:id`
*   **Auth Required**: Yes (`Bearer <token>` - Role: `ADMIN` only)
*   **Request Body**:
    ```json
    {
      "price": 899.99,
      "stock": 45
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Product updated successfully",
      "data": {
        "id": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
        "name": "Smart Phone X",
        "price": 899.99,
        "stock": 45,
        "status": "ACTIVE",
        "categoryId": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q"
      }
    }
    ```

### 3.5 Delete Product (Soft Delete)
*   **Method**: `DELETE`
*   **Route**: `/products/:id`
*   **Auth Required**: Yes (`Bearer <token>` - Role: `ADMIN` only)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Product deleted successfully",
      "data": null
    }
    ```

---

## 4. Users (`/users`)

### 4.1 Get My Profile
*   **Method**: `GET`
*   **Route**: `/users/me`
*   **Auth Required**: Yes (`Bearer <token>` - Role: Any)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Profile retrieved successfully",
      "data": {
        "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "name": "John Doe",
        "email": "johndoe@example.com",
        "role": "CUSTOMER",
        "status": "ACTIVE",
        "isDeleted": false,
        "createdAt": "2026-08-11T12:00:00.000Z",
        "updatedAt": "2026-08-11T12:00:00.000Z"
      }
    }
    ```

### 4.2 Update My Profile
*   **Method**: `PATCH`
*   **Route**: `/users/me`
*   **Auth Required**: Yes (`Bearer <token>` - Role: Any)
*   **Request Body**:
    ```json
    {
      "name": "Johnathan Doe"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Profile updated successfully",
      "data": {
        "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "name": "Johnathan Doe",
        "email": "johndoe@example.com",
        "role": "CUSTOMER",
        "status": "ACTIVE",
        "isDeleted": false,
        "createdAt": "2026-08-11T12:00:00.000Z",
        "updatedAt": "2026-08-11T12:30:00.000Z"
      }
    }
    ```

### 4.3 Get All Users
*   **Method**: `GET`
*   **Route**: `/users`
*   **Auth Required**: Yes (`Bearer <token>` - Role: `ADMIN` only)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Users retrieved successfully",
      "data": [
        {
          "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
          "name": "Johnathan Doe",
          "email": "johndoe@example.com",
          "role": "CUSTOMER",
          "status": "ACTIVE"
        }
      ]
    }
    ```

### 4.4 Admin Update User Role/Status
*   **Method**: `PATCH`
*   **Route**: `/users/:id`
*   **Auth Required**: Yes (`Bearer <token>` - Role: `ADMIN` only)
*   **Request Body**:
    ```json
    {
      "status": "BLOCKED" // or "ACTIVE"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "User status/role updated successfully by Admin",
      "data": {
        "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "name": "Johnathan Doe",
        "email": "johndoe@example.com",
        "role": "CUSTOMER",
        "status": "BLOCKED",
        "isDeleted": false
      }
    }
    ```

### 4.5 Delete User Profile (Self or Admin)
*   **Method**: `DELETE`
*   **Route**: `/users/:id`
*   **Auth Required**: Yes (`Bearer <token>`)
    *   *Self-deletion is allowed. Admins can delete any user.*
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "User account deleted successfully",
      "data": null
    }
    ```

---

## 5. Reviews (`/reviews`)

### 5.1 Get Product Reviews
*   **Method**: `GET`
*   **Route**: `/reviews/product/:productId`
*   **Auth Required**: None
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Reviews retrieved successfully",
      "data": [
        {
          "id": "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
          "rating": 5,
          "comment": "Amazing quality, highly recommend!",
          "userId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
          "productId": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
          "isDeleted": false,
          "user": {
            "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
            "name": "Johnathan Doe"
          }
        }
      ]
    }
    ```

### 5.2 Create Review
*   **Method**: `POST`
*   **Route**: `/reviews`
*   **Auth Required**: Yes (`Bearer <token>` - Role: Any)
*   **Request Body**:
    ```json
    {
      "productId": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
      "rating": 5,
      "comment": "Amazing quality, highly recommend!"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Review created successfully",
      "data": {
        "id": "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
        "rating": 5,
        "comment": "Amazing quality, highly recommend!",
        "userId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "productId": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
        "isDeleted": false,
        "user": {
          "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
          "name": "Johnathan Doe"
        }
      }
    }
    ```

### 5.3 Update Review
*   **Method**: `PATCH`
*   **Route**: `/reviews/:id`
*   **Auth Required**: Yes (`Bearer <token>` - *Must be review author*)
*   **Request Body**:
    ```json
    {
      "rating": 4,
      "comment": "Actually, it's good but has minor scratches."
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Review updated successfully",
      "data": {
        "id": "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
        "rating": 4,
        "comment": "Actually, it's good but has minor scratches.",
        "userId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "productId": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s"
      }
    }
    ```

### 5.4 Delete Review (Author or Admin)
*   **Method**: `DELETE`
*   **Route**: `/reviews/:id`
*   **Auth Required**: Yes (`Bearer <token>` - *Must be author or ADMIN*)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Review deleted successfully",
      "data": null
    }
    ```

---

## 6. Orders (`/orders`)

### 6.1 Create Order (Checkout)
*   **Method**: `POST`
*   **Route**: `/orders`
*   **Auth Required**: Yes (`Bearer <token>` - Role: Any)
*   **Request Body**:
    ```json
    {
      "items": [
        {
          "productId": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
          "quantity": 2
        }
      ]
    }
    ```
*   **Response (201 Created)**:
    *   *Note: Decrements the product stock levels inside a transaction.*
    ```json
    {
      "success": true,
      "message": "Order created successfully",
      "data": {
        "id": "6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u",
        "userId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "totalAmount": 1799.98,
        "status": "PENDING",
        "isDeleted": false,
        "createdAt": "2026-08-11T12:45:00.000Z",
        "updatedAt": "2026-08-11T12:45:00.000Z",
        "orderItems": [
          {
            "id": "7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v",
            "orderId": "6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u",
            "productId": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
            "quantity": 2,
            "price": 899.99,
            "product": {
              "id": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
              "name": "Smart Phone X"
            }
          }
        ]
      }
    }
    ```

### 6.2 Get My Orders (History)
*   **Method**: `GET`
*   **Route**: `/orders/my-orders`
*   **Auth Required**: Yes (`Bearer <token>` - Role: Any)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Order history retrieved successfully",
      "data": [
        {
          "id": "6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u",
          "totalAmount": 1799.98,
          "status": "PENDING",
          "createdAt": "2026-08-11T12:45:00.000Z",
          "orderItems": [
            {
              "id": "7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v",
              "productId": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
              "quantity": 2,
              "price": 899.99,
              "product": {
                "id": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
                "name": "Smart Phone X"
              }
            }
          ]
        }
      ]
    }
    ```

### 6.3 Get Order by ID
*   **Method**: `GET`
*   **Route**: `/orders/:id`
*   **Auth Required**: Yes (`Bearer <token>` - *Must be owner or ADMIN*)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Order details retrieved successfully",
      "data": {
        "id": "6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u",
        "userId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "totalAmount": 1799.98,
        "status": "PENDING",
        "user": {
          "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
          "name": "Johnathan Doe",
          "email": "johndoe@example.com"
        },
        "orderItems": [
          {
            "id": "7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v",
            "productId": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
            "quantity": 2,
            "price": 899.99,
            "product": {
              "id": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
              "name": "Smart Phone X",
              "price": 899.99
            }
          }
        ]
      }
    }
    ```

### 6.4 Get All Orders (Admin Log)
*   **Method**: `GET`
*   **Route**: `/orders`
*   **Auth Required**: Yes (`Bearer <token>` - Role: `ADMIN` only)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "All orders retrieved successfully",
      "data": [
        {
          "id": "6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u",
          "totalAmount": 1799.98,
          "status": "PENDING",
          "user": {
            "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
            "name": "Johnathan Doe",
            "email": "johndoe@example.com"
          },
          "orderItems": [...]
        }
      ]
    }
    ```

### 6.5 Update Order Status (Shipment/Cancellation)
*   **Method**: `PATCH`
*   **Route**: `/orders/:id/status`
*   **Auth Required**: Yes (`Bearer <token>` - Role: `ADMIN` only)
*   **Request Body**:
    ```json
    {
      "status": "SHIPPED" // "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
    }
    ```
*   **Response (200 OK)**:
    *   *Note: Updating status to CANCELLED automatically restores inventory levels in products table.*
    ```json
    {
      "success": true,
      "message": "Order status updated successfully",
      "data": {
        "id": "6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u",
        "userId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "totalAmount": 1799.98,
        "status": "SHIPPED",
        "isDeleted": false
      }
    }
    ```

### 6.6 Delete Order (Soft Delete)
*   **Method**: `DELETE`
*   **Route**: `/orders/:id`
*   **Auth Required**: Yes (`Bearer <token>` - Role: `ADMIN` only)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Order deleted successfully",
      "data": null
    }
    ```
