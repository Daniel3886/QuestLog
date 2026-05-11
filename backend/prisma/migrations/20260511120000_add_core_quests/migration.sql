-- Quest enums
CREATE TYPE "QuestFrequency" AS ENUM ('DAILY', 'WEEKLY', 'CUSTOM');
CREATE TYPE "QuestRating" AS ENUM ('ENERGIZED', 'OKAY', 'SLOG');
CREATE TYPE "QuestTrackingType" AS ENUM ('BINARY', 'NUMERIC', 'TIMER');
CREATE TYPE "QuestProofRequired" AS ENUM ('NONE', 'IMAGE', 'TEXT');

-- Quests (personal tracking goals owned by a user)
CREATE TABLE "quests" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tracking_type" "QuestTrackingType" NOT NULL DEFAULT 'NUMERIC',
    "target_value" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT,
    "proof_required" "QuestProofRequired" NOT NULL DEFAULT 'NONE',
    "frequency" "QuestFrequency" NOT NULL DEFAULT 'DAILY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- Quest Logs (daily progress entries)
CREATE TABLE "quest_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "quest_id" TEXT NOT NULL,
    "log_date" TIMESTAMP(3) NOT NULL,
    "current_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating" "QuestRating",
    "note" TEXT,
    "proof_url" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quest_logs_pkey" PRIMARY KEY ("id")
);

-- Performance Indexes
CREATE INDEX "quests_creator_id_idx" ON "quests"("creator_id");
CREATE INDEX "quest_logs_user_id_idx" ON "quest_logs"("user_id");
CREATE INDEX "quest_logs_quest_id_idx" ON "quest_logs"("quest_id");
CREATE INDEX "quest_logs_logged_at_idx" ON "quest_logs"("logged_at");
CREATE UNIQUE INDEX "quest_logs_quest_id_log_date_key" ON "quest_logs"("quest_id", "log_date");

-- Foreign Keys
ALTER TABLE "quests" ADD CONSTRAINT "quests_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quest_logs" ADD CONSTRAINT "quest_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quest_logs" ADD CONSTRAINT "quest_logs_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
