import React from 'react';
import Link from 'next/link';
import type { RankedUser } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const patchNotes = [
  {
    id: 1,
    title: 'v1.2.0 – Party Battles',
    date: '2025-02-10',
    desc: 'Guilds can now challenge each other in weekly dungeon races.',
  },
  {
    id: 2,
    title: 'Tavern Event: Dragon Hunt',
    date: '2025-02-05',
    desc: 'Global boss health bar – defeat it together for epic loot.',
  },
  {
    id: 3,
    title: 'Streak Forge Update',
    date: '2025-01-28',
    desc: 'One free miss per week – your streak is protected!',
  },
];

const reviews = [
  {
    id: 1,
    name: 'PixelWizard',
    avatar: '🧙',
    rating: 5,
    text: 'Finally a habit tracker that feels like an RPG! The party system is pure genius.',
  },
  {
    id: 2,
    name: 'RetroRogue',
    avatar: '🗡️',
    rating: 5,
    text: 'I actually wake up excited to log my quests. The pixel art vibes are perfect.',
  },
  {
    id: 3,
    name: 'QuestQueen',
    avatar: '👑',
    rating: 4,
    text: 'Guild quests brought my friends together. We even created a real‑life running club.',
  },
];

async function getTopStreakHeroes(): Promise<
  { rank: number; name: string; streak: number; avatar: string }[]
> {
  try {
    const res = await fetch(`${API_URL}/leaderboards/users?metric=streak`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const users = (await res.json()) as RankedUser[];
    return users.slice(0, 5).map((u) => ({
      rank: u.rank,
      name: u.username,
      streak: u.streak,
      avatar: u.avatar,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const topUsers = await getTopStreakHeroes();

  return (
    <div className="pixel-landing">
      <section className="hero pixel-card">
        <div className="hero__content">
          <h1 className="pixel-title">
            <span className="pixel-title__big">QUESTLOG</span>
            <span className="pixel-title__small">Turn habits into an adventure</span>
          </h1>
          <p className="hero__text">
            Level up your daily life. Solo quests, guild battles, and global events – all in one pixel‑perfect world.
          </p>
          <div className="hero__buttons">
            <Link href="/register" className="pixel-btn pixel-btn--primary">
              ▶ START QUEST
            </Link>
            <Link href="/tavern" className="pixel-btn pixel-btn--secondary">
              🍺 VISIT TAVERN
            </Link>
          </div>
        </div>
        <div className="hero__pixel-art">
          <div className="pixel-hero-character">🐉</div>
          <div className="pixel-hero-stats">
            <span>❤️ 100 HP</span>
            <span>⚔️ LVL 5</span>
            <span>✨ 1,247 XP</span>
          </div>
        </div>
      </section>

      <section className="features">
        <h2 className="pixel-heading">⚔️ GAME MODES ⚔️</h2>
        <div className="features__grid">
          <Link href="/lobby" className="feature-card pixel-card">
            <div className="feature-card__icon">🏠</div>
            <h3>LOBBY</h3>
            <p>
              Solo quests, daily streaks, and personal achievements. Your private hub for self‑improvement.
            </p>
          </Link>
          <Link href="/tavern" className="feature-card pixel-card">
            <div className="feature-card__icon">🍺</div>
            <h3>TAVERN</h3>
            <p>
              Join public events, fight global bosses, and compete on leaderboards. No guild required.
            </p>
          </Link>
          <Link href="/guilds" className="feature-card pixel-card">
            <div className="feature-card__icon">⚔️</div>
            <h3>GUILDS</h3>
            <p>
              Team up with 2–10 friends. Complete party quests, earn gems, and unlock exclusive pixel cosmetics.
            </p>
          </Link>
        </div>
      </section>

      <section className="news">
        <h2 className="pixel-heading">📜 PATCH NOTES 📜</h2>
        <div className="news__grid">
          {patchNotes.map((item) => (
            <div key={item.id} className="news-card pixel-card">
              <span className="news-card__date">{item.date}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="social-proof">
        <div className="reviews">
          <h2 className="pixel-heading">⭐ ADVENTURER REVIEWS ⭐</h2>
          <div className="reviews__grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card pixel-card">
                <div className="review-card__avatar">{review.avatar}</div>
                <div className="review-card__content">
                  <h4>{review.name}</h4>
                  <div className="review-card__stars">
                    {'★'.repeat(review.rating)}
                  </div>
                  <p>“{review.text}”</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="leaderboard pixel-card">
          <h2 className="pixel-heading">🏆 TOP STREAK HEROES 🏆</h2>
          <div className="leaderboard__list">
            {topUsers.length === 0 ? (
              <p>Sign up and build your streak to appear here!</p>
            ) : (
              topUsers.map((user, idx) => (
                <div
                  key={user.rank}
                  className="leaderboard-entry"
                  style={{ '--order': idx } as React.CSSProperties}
                >
                  <span className="leaderboard-entry__rank">#{user.rank}</span>
                  <span className="leaderboard-entry__avatar">{user.avatar}</span>
                  <span className="leaderboard-entry__name">{user.name}</span>
                  <span className="leaderboard-entry__streak">
                    {user.streak} days 🔥
                  </span>
                </div>
              ))
            )}
          </div>
          <Link href="/leaderboards" className="pixel-btn pixel-btn--small">
            View full rankings
          </Link>
        </div>
      </section>

      <section className="cta">
        <div className="cta__inner pixel-card">
          <h2>Ready to begin your quest?</h2>
          <Link href="/register" className="pixel-btn pixel-btn--large">
            🎮 START YOUR ADVENTURE 🎮
          </Link>
        </div>
      </section>
    </div>
  );
}
