import type { Metadata } from "next";
import "./globals.scss";
import React from "react";
import Link from "next/link";

const getUserData = async () => {
  // Simulate auth check – replace with real session logic
  if (false) {
    return { name: "John Doe" };
  }
  return null;
};

export const metadata: Metadata = {
  title: "QuestLog – Pixel Habit RPG",
  description: "Turn your daily habits into an 8‑bit adventure. Solo quests, guild battles, and global events.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUserData();

  return (
    <html lang="en">
      <body className="antialiased">
  <div className="scanline"></div>
  <div className="parallax-bg"></div>
  <header className="pixel-topbar" role="banner">
          <div className="pixel-topbar__inner">
            <Link href="/" className="pixel-logo">
              QUESTLOG
              <span className="pixel-logo__sub">v1.2.0</span>
            </Link>

            <nav className="pixel-nav" aria-label="Main navigation">
              <Link href="/lobby">🏠 LOBBY</Link>
              <Link href="/tavern">🍺 TAVERN</Link>
              <Link href="/guilds">⚔️ GUILDS</Link>
              <Link href="/leaderboards">🏆 RANK</Link>
            </nav>

            <div className="pixel-actions">
              {user ? (
                <button className="pixel-avatar-btn" aria-label="User menu">
                  <span className="pixel-avatar">👤</span>
                  <span className="pixel-avatar-name">{user.name}</span>
                </button>
              ) : (
                <Link href="/login" className="pixel-btn pixel-btn--small">
                  🔑 LOGIN
                </Link>
              )}
            </div>
          </div>
        </header>
  <main className="pixel-main">{children}</main>
  <footer className="pixel-footer">
          <div className="pixel-footer__inner">
            <p>© 2025 QUESTLOG – FORGE YOUR LEGEND</p>
            <div className="pixel-footer__links">
              <Link href="/about">About</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
