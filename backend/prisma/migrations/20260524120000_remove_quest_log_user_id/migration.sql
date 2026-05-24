ALTER TABLE "quest_logs" DROP CONSTRAINT "quest_logs_user_id_fkey";
DROP INDEX "quest_logs_user_id_idx";
ALTER TABLE "quest_logs" DROP COLUMN "user_id";
