-- Add is_banned column to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_banned" BOOLEAN NOT NULL DEFAULT false;

-- Create Admin table
CREATE TABLE IF NOT EXISTS "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- Create unique index on admin email
CREATE UNIQUE INDEX IF NOT EXISTS "admins_email_key" ON "admins"("email");
