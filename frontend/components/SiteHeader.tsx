'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isLoggedIn, logout } from '@/lib/auth';
import { usersApi } from '@/lib/api';

export default function SiteHeader() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const authed = isLoggedIn();
    setLoggedIn(authed);
    if (authed) {
      usersApi
        .me()
        .then((u) => setUsername(u.username))
        .catch(() => setUsername(null));
    }
  }, []);

  return (
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
          {loggedIn ? (
            <>
              <span className="pixel-avatar-name">{username ?? '…'}</span>
              <button
                type="button"
                className="pixel-btn pixel-btn--small"
                onClick={() => logout()}
              >
                LOGOUT
              </button>
            </>
          ) : (
            <Link href="/login" className="pixel-btn pixel-btn--small">
              🔑 LOGIN
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
