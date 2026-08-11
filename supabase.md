# Supabase Hosting & Connection Guide

This guide explains how to connect and host your PostgreSQL database on **Supabase** for this Express, TypeScript, and Prisma backend application.

---

## 1. Do I just need the `DATABASE_URL`?

**Yes!** For your Express backend and Vercel deployment, Supabase acts as your hosted cloud PostgreSQL database. 

Because we use **Prisma ORM** with **Vercel Serverless Functions**, Supabase provides two connection URLs:

1. **`DATABASE_URL` (Connection Pooler - Port `6543`)**: Used by your Express app and Vercel serverless functions to handle high-concurrency queries without exhausting database connections.
2. **`DIRECT_URL` (Direct Connection - Port `5432`)**: Used exclusively by Prisma CLI to run database migrations (`npx prisma migrate dev`).

---

## 2. Step-by-Step Supabase Setup

### Step 1: Create a Supabase Project
1. Go to **[database.new](https://database.new)** (or log in to **[supabase.com](https://supabase.com)**).
2. Click **"New Project"**.
3. Fill in the project details:
   - **Name**: `scic-backend` (or any name of your choice)
   - **Database Password**: Set a strong password (and **remember it**!)
   - **Region**: Choose a region closest to your users or Vercel deployment region.
4. Click **"Create new project"** and wait ~1 minute for your PostgreSQL database to provision.

---

### Step 2: Copy Connection Strings
1. In your Supabase Dashboard, go to **Project Settings** (gear icon at bottom left) -> **Database**.
2. Scroll down to **Connection string**.

#### A. Copy Connection Pooler URL (`DATABASE_URL`)
* Select the **Transaction** mode tab (or Pooler mode).
* Copy the connection string (Port `6543`). It looks like this:
  ```env
  DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
  ```

#### B. Copy Direct Connection URL (`DIRECT_URL`)
* Select the **Session** / **Direct** connection tab.
* Copy the direct connection string (Port `5432`). It looks like this:
  ```env
  DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
  ```

> 💡 **Note**: Replace `[YOUR-PASSWORD]` in both strings with the database password you created in Step 1.

---

### Step 3: Update `.env` for Local Development
Update your local [.env](file:///d:/Everything%20Else/Programming%20Hero/SCIC/prisma-postgre/.env) file:

```env
PORT=5000
NODE_ENV=development

# Supabase Connection Settings
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Authentication & Security Secrets
JWT_ACCESS_SECRET="7f9e8a3b5c1d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"
JWT_REFRESH_EXPIRES_IN="30d"

BCRYPT_SALT_ROUNDS=12
```

---

### Step 4: Run Migrations against Supabase
Run the migration command in your terminal. Prisma will automatically use `DIRECT_URL` to create the tables in your Supabase database:

```bash
npx prisma migrate dev --name init
```

---

### Step 5: Add Environment Variables to Vercel
When deploying your project to Vercel:
1. Open your project settings in Vercel -> **Environment Variables**.
2. Add both `DATABASE_URL` and `DIRECT_URL` with your Supabase connection strings.
3. Deploy!

---

## 3. How Prisma Schema Uses Both URLs

Our `prisma/schema.prisma` is pre-configured to support both:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // Used by Express/Vercel for queries via Pooler
  directUrl = env("DIRECT_URL")     // Used by Prisma CLI for migrations
}
```
