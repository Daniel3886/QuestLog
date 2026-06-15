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
      <Link href="/lobby">🏠 <span>LOBBY</span></Link>
          {!hideSocial && (<>
          <Link href="/tavern">🍺 <span>TAVERN</span></Link>
          <Link href="/guilds">⚔️ <span>GUILDS</span></Link>
          <Link href="/shop">🛒 <span>SHOP</span></Link>
          <Link href="/leaderboards">🏆 <span>RANK</span></Link></>)}
    </>
  );
}