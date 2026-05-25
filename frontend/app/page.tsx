// app/page.tsx
import React from 'react';

// Sample data
const patchNotes = [
  { id: 1, title: 'v1.2.0 – Party Battles', date: '2025-02-10', desc: 'Guilds can now challenge each other in weekly dungeon races.' },
  { id: 2, title: 'Tavern Event: Dragon Hunt', date: '2025-02-05', desc: 'Global boss health bar – defeat it together for epic loot.' },
  { id: 3, title: 'Streak Forge Update', date: '2025-01-28', desc: 'One free miss per week – your streak is protected!' },
];

const reviews = [
  { id: 1, name: 'PixelWizard', avatar: '🧙', rating: 5, text: 'Finally a habit tracker that feels like an RPG! The party system is pure genius.' },
  { id: 2, name: 'RetroRogue', avatar: '🗡️', rating: 5, text: 'I actually wake up excited to log my quests. The pixel art vibes are perfect.' },
  { id: 3, name: 'QuestQueen', avatar: '👑', rating: 4, text: 'Guild quests brought my friends together. We even created a real‑life running club.' },
];

const topUsers = [
  { rank: 1, name: 'ShadowBlade', streak: 127, avatar: '🌙' },
  { rank: 2, name: 'MageLena', streak: 98, avatar: '✨' },
  { rank: 3, name: 'RogueX', streak: 85, avatar: '🗡️' },
  { rank: 4, name: 'HealerAmy', streak: 72, avatar: '💚' },
  { rank: 5, name: 'BerserkKarl', streak: 61, avatar: '⚡' },
];

export default function HomePage() {
  return (
    <div className="pixel-landing">
      {/* Hero Section */}
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
            <button className="pixel-btn pixel-btn--primary">▶ START QUEST</button>
            <button className="pixel-btn pixel-btn--secondary">🎮 WATCH TRAILER</button>
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

      {/* Game Features */}
      <section className="features">
        <h2 className="pixel-heading">⚔️ GAME MODES ⚔️</h2>
        <div className="features__grid">
          <div className="feature-card pixel-card">
            <div className="feature-card__icon">🏠</div>
            <h3>LOBBY</h3>
            <p>Solo quests, daily streaks, and personal achievements. Your private hub for self‑improvement.</p>
          </div>
          <div className="feature-card pixel-card">
            <div className="feature-card__icon">🍺</div>
            <h3>TAVERN</h3>
            <p>Join public events, fight global bosses, and compete on leaderboards. No guild required.</p>
          </div>
          <div className="feature-card pixel-card">
            <div className="feature-card__icon">⚔️</div>
            <h3>GUILDS</h3>
            <p>Team up with 2–10 friends. Complete party quests, earn gems, and unlock exclusive pixel cosmetics.</p>
          </div>
        </div>
      </section>

      {/* Patch Notes (News) */}
      <section className="news">
        <h2 className="pixel-heading">📜 PATCH NOTES 📜</h2>
        <div className="news__grid">
          {patchNotes.map(item => (
            <div key={item.id} className="news-card pixel-card">
              <span className="news-card__date">{item.date}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews & Leaderboard */}
      <section className="social-proof">
        <div className="reviews">
          <h2 className="pixel-heading">⭐ ADVENTURER REVIEWS ⭐</h2>
          <div className="reviews__grid">
            {reviews.map(review => (
              <div key={review.id} className="review-card pixel-card">
                <div className="review-card__avatar">{review.avatar}</div>
                <div className="review-card__content">
                  <h4>{review.name}</h4>
                  <div className="review-card__stars">{'★'.repeat(review.rating)}</div>
                  <p>“{review.text}”</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="leaderboard pixel-card">
          <h2 className="pixel-heading">🏆 TOP STREAK HEROES 🏆</h2>
          <div className="leaderboard__list">
  {topUsers.map((user, idx) => (
    <div
      key={user.rank}
      className="leaderboard-entry"
      style={{ '--order': idx } as React.CSSProperties}
    >
                <span className="leaderboard-entry__rank">#{user.rank}</span>
                <span className="leaderboard-entry__avatar">{user.avatar}</span>
                <span className="leaderboard-entry__name">{user.name}</span>
                <span className="leaderboard-entry__streak">{user.streak} days 🔥</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta">
        <div className="cta__inner pixel-card">
          <h2>Ready to begin your quest?</h2>
          <button className="pixel-btn pixel-btn--large">🎮 START YOUR ADVENTURE 🎮</button>
        </div>
      </section>
    </div>
  );
}
