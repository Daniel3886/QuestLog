-- Rename legacy User table and columns to match Prisma @@map("users")
DO $$
BEGIN
  IF to_regclass('public."User"') IS NOT NULL AND to_regclass('public.users') IS NULL THEN
    ALTER TABLE "User" RENAME TO "users";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'createdAt'
  ) THEN
    ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
    ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END $$;

-- User profile & progression
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" TEXT NOT NULL DEFAULT '🧙';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "coins" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "xp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "level" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "week_streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "active_days" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "quests_completed" INTEGER NOT NULL DEFAULT 0;

UPDATE "users"
SET "username" = CONCAT('adventurer_', SUBSTRING("id", 1, 8))
WHERE "username" IS NULL;

ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

-- Quest extensions
CREATE TYPE "QuestType" AS ENUM ('PERSONAL', 'GUILD', 'PUBLIC');
CREATE TYPE "QuestCategory" AS ENUM ('FITNESS', 'EDUCATION', 'CREATIVITY', 'WELLNESS', 'OTHER');
CREATE TYPE "QuestDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

ALTER TABLE "quests" ADD COLUMN IF NOT EXISTS "icon" TEXT NOT NULL DEFAULT '⚔️';
ALTER TABLE "quests" ADD COLUMN IF NOT EXISTS "type" "QuestType" NOT NULL DEFAULT 'PERSONAL';
ALTER TABLE "quests" ADD COLUMN IF NOT EXISTS "category" "QuestCategory";
ALTER TABLE "quests" ADD COLUMN IF NOT EXISTS "difficulty" "QuestDifficulty";
ALTER TABLE "quests" ADD COLUMN IF NOT EXISTS "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "quests" ADD COLUMN IF NOT EXISTS "rating_count" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "quests_type_idx" ON "quests"("type");
CREATE INDEX IF NOT EXISTS "quests_category_idx" ON "quests"("category");

-- Domain enums
CREATE TYPE "PersonalQuestStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED');
CREATE TYPE "GuildMemberRole" AS ENUM ('LEADER', 'MEMBER');
CREATE TYPE "GuildQuestStatus" AS ENUM ('DRAFTING', 'ACTIVE', 'COMPLETED', 'FAILED');
CREATE TYPE "GuildQuestType" AS ENUM ('SUMMATIVE', 'CONCURRENT', 'STREAK');
CREATE TYPE "CommentTargetType" AS ENUM ('EVENT', 'QUEST', 'GUILD', 'GUILD_QUEST', 'TAVERN');
CREATE TYPE "ReportedType" AS ENUM ('USER', 'COMMENT', 'QUEST', 'GUILD_QUEST');
CREATE TYPE "FriendStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');
CREATE TYPE "ItemType" AS ENUM ('BADGE', 'AVATAR', 'BOOST', 'COSMETIC');
CREATE TYPE "OwnerType" AS ENUM ('USER', 'GUILD');

-- Personal quest enrollments (public/guild adoption)
CREATE TABLE "personal_quests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "quest_id" TEXT NOT NULL,
    "status" "PersonalQuestStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "repetitive" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "personal_quests_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "personal_quests_user_id_quest_id_key" ON "personal_quests"("user_id", "quest_id");
CREATE INDEX "personal_quests_user_id_idx" ON "personal_quests"("user_id");

-- Guilds
CREATE TABLE "guilds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatar" TEXT NOT NULL DEFAULT '⚔️',
    "gems" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "guilds_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "guild_members" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "GuildMemberRole" NOT NULL DEFAULT 'MEMBER',
    "contribution" INTEGER NOT NULL DEFAULT 0,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "guild_members_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "guild_members_guild_id_user_id_key" ON "guild_members"("guild_id", "user_id");
CREATE INDEX "guild_members_user_id_idx" ON "guild_members"("user_id");

CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_coins" INTEGER NOT NULL DEFAULT 0,
    "price_gems" INTEGER NOT NULL DEFAULT 0,
    "type" "ItemType" NOT NULL DEFAULT 'BADGE',
    "icon" TEXT NOT NULL DEFAULT '🏅',
    "file_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "guild_quests" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "quest_id" TEXT NOT NULL,
    "quest_type" "GuildQuestType" NOT NULL DEFAULT 'SUMMATIVE',
    "status" "GuildQuestStatus" NOT NULL DEFAULT 'DRAFTING',
    "votes" INTEGER NOT NULL DEFAULT 0,
    "current_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "reward_gems" INTEGER NOT NULL DEFAULT 0,
    "reward_item_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "guild_quests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "guild_quests_guild_id_idx" ON "guild_quests"("guild_id");
CREATE INDEX "guild_quests_status_idx" ON "guild_quests"("status");

CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT '🌍',
    "target_value" DOUBLE PRECISION NOT NULL,
    "current_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "reward_coins" INTEGER NOT NULL DEFAULT 0,
    "reward_item_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "events_end_date_idx" ON "events"("end_date");

CREATE TABLE "participations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "contribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "participations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "participations_user_id_event_id_key" ON "participations"("user_id", "event_id");
CREATE INDEX "participations_event_id_idx" ON "participations"("event_id");

CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_type" "CommentTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reported" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "comments_target_type_target_id_idx" ON "comments"("target_type", "target_id");
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reported_type" "ReportedType" NOT NULL,
    "reported_id" TEXT NOT NULL,
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "reports_reported_type_reported_id_idx" ON "reports"("reported_type", "reported_id");

CREATE TABLE "friends" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "friend_id" TEXT NOT NULL,
    "status" "FriendStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "friends_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "friends_user_id_friend_id_key" ON "friends"("user_id", "friend_id");
CREATE INDEX "friends_friend_id_idx" ON "friends"("friend_id");

CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "owner_type" "OwnerType" NOT NULL,
    "item_id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "inventory_owner_id_owner_type_idx" ON "inventory"("owner_id", "owner_type");

-- Foreign keys
ALTER TABLE "personal_quests" ADD CONSTRAINT "personal_quests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "personal_quests" ADD CONSTRAINT "personal_quests_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guild_members" ADD CONSTRAINT "guild_members_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guild_members" ADD CONSTRAINT "guild_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guild_quests" ADD CONSTRAINT "guild_quests_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guild_quests" ADD CONSTRAINT "guild_quests_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guild_quests" ADD CONSTRAINT "guild_quests_reward_item_id_fkey" FOREIGN KEY ("reward_item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_reward_item_id_fkey" FOREIGN KEY ("reward_item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "participations" ADD CONSTRAINT "participations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "participations" ADD CONSTRAINT "participations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "friends" ADD CONSTRAINT "friends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "friends" ADD CONSTRAINT "friends_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Point quest FKs at users (legacy referenced "User")
ALTER TABLE "quests" DROP CONSTRAINT IF EXISTS "quests_creator_id_fkey";
ALTER TABLE "quests" ADD CONSTRAINT "quests_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quest_logs" DROP CONSTRAINT IF EXISTS "quest_logs_user_id_fkey";
ALTER TABLE "quest_logs" ADD CONSTRAINT "quest_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
