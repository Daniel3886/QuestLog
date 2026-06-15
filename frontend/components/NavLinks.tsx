'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NavLinks() {
  const [hideSocial, setHideSocial] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('questlog_hide_social');
    setHideSocial(saved === 'true');

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'questlog_hide_social') {
        setHideSocial(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <>
      <Link href="/lobby">Lobby</Link>
      {!hideSocial && <Link href="/tavern">Tavern</Link>}
      {!hideSocial && <Link href="/guilds">Guilds</Link>}
      <Link href="/leaderboards">Leaderboards</Link>
      <Link href="/shop">Shop</Link>
    </>
  );
}