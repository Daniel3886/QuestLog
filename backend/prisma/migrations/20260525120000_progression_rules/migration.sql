-- Event XP reward (admin-configured per event)
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "reward_xp" INTEGER NOT NULL DEFAULT 0;

-- Track one-time event payout per participant
ALTER TABLE "participations" ADD COLUMN IF NOT EXISTS "rewards_claimed" BOOLEAN NOT NULL DEFAULT false;
