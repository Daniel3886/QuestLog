'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isLoggedIn, logout } from '@/lib/auth';
import { usersApi } from '@/lib/api';

export default function SiteHeader() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState('🧙');

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
          <Link href="/lobby">🏠 <span>LOBBY</span></Link>
          <Link href="/tavern">🍺 <span>TAVERN</span></Link>
          <Link href="/guilds">⚔️ <span>GUILDS</span></Link>
          <Link href="/leaderboards">🏆 <span>RANK</span></Link>
        </nav>

        <div className="pixel-actions">
          {loggedIn ? (
            <div className="pixel-user-menu">
              <div className="pixel-user-info">
                <span className="pixel-user-avatar">{userAvatar}</span>
                <span className="pixel-username">{username ?? '…'}</span>
              </div>
              <button
                type="button"
                className="pixel-logout-btn"
                onClick={() => logout()}
                aria-label="Logout"
              >
                🚪
              </button>
            </div>
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
