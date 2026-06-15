/*
  Warnings:

  - You are about to drop the `guild_join_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "guild_join_requests" DROP CONSTRAINT "guild_join_requests_guildId_fkey";

-- DropForeignKey
ALTER TABLE "guild_join_requests" DROP CONSTRAINT "guild_join_requests_userId_fkey";

-- DropTable
DROP TABLE "guild_join_requests";
