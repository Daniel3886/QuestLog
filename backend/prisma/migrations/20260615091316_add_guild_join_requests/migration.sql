/*
  Warnings:

  - The values [BOOST] on the enum `ItemType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ItemType_new" AS ENUM ('BADGE', 'AVATAR', 'COSMETIC');
ALTER TABLE "public"."items" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "items" ALTER COLUMN "type" TYPE "ItemType_new" USING ("type"::text::"ItemType_new");
ALTER TYPE "ItemType" RENAME TO "ItemType_old";
ALTER TYPE "ItemType_new" RENAME TO "ItemType";
DROP TYPE "public"."ItemType_old";
ALTER TABLE "items" ALTER COLUMN "type" SET DEFAULT 'BADGE';
COMMIT;

-- CreateTable
CREATE TABLE "guild_join_requests" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guild_join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guild_join_requests_guildId_userId_key" ON "guild_join_requests"("guildId", "userId");

-- AddForeignKey
ALTER TABLE "guild_join_requests" ADD CONSTRAINT "guild_join_requests_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_join_requests" ADD CONSTRAINT "guild_join_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
