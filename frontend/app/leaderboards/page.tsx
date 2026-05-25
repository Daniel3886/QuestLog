// app/leaderboards/page.tsx
"use client";

import React, { useState } from 'react';
import './leaderboards.scss';

// Types
interface RankedUser {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  level: number;
  streak: number;
  coins: number;
  totalQuests: number;
  totalXp: number;
}

interface RankedGuild {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  level: number;
  gems: number;
  members: number;
  totalQuests: number;
  totalXp: number;
}

// Mock data - User rankings
const baseUserRankings: RankedUser[] = [
  { id: 'u1', rank: 1, username: 'ShadowBlade', avatar: '🗡️', level: 42, streak: 127, coins: 6450, totalQuests: 342, totalXp: 28400 },
  { id: 'u2', rank: 2, username: 'MageLena', avatar: '✨', level: 38, streak: 98, coins: 7200, totalQuests: 298, totalXp: 25100 },
  { id: 'u3', rank: 3, username: 'RogueX', avatar: '🗡️', level: 35, streak: 85, coins: 6800, totalQuests: 275, totalXp: 22800 },
  { id: 'u4', rank: 4, username: 'HealerAmy', avatar: '💚', level: 33, streak: 72, coins: 6100, totalQuests: 249, totalXp: 20900 },
  { id: 'u5', rank: 5, username: 'BerserkKarl', avatar: '⚡', level: 31, streak: 61, coins: 5800, totalQuests: 228, totalXp: 19100 },
  { id: 'u6', rank: 6, username: 'PaladinGrace', avatar: '🛡️', level: 29, streak: 54, coins: 5100, totalQuests: 201, totalXp: 17200 },
  { id: 'u7', rank: 7, username: 'DruidFinn', avatar: '🌿', level: 28, streak: 49, coins: 4850, totalQuests: 189, totalXp: 16400 },
  { id: 'u8', rank: 8, username: 'ArcherLia', avatar: '🏹', level: 26, streak: 44, coins: 4520, totalQuests: 176, totalXp: 15100 },
  { id: 'u9', rank: 9, username: 'WardenOrin', avatar: '🔮', level: 25, streak: 38, coins: 4210, totalQuests: 162, totalXp: 13900 },
  { id: 'u10', rank: 10, username: 'HunterKai', avatar: '🐺', level: 24, streak: 35, coins: 3980, totalQuests: 151, totalXp: 12800 },
];

// Mock data - Guild rankings
const baseGuildRankings: RankedGuild[] = [
  { id: 'g1', rank: 1, name: 'Dragon Slayers', avatar: '🐉', level: 12, gems: 4250, members: 8, totalQuests: 56, totalXp: 18700 },
  { id: 'g2', rank: 2, name: 'Phoenix Rising', avatar: '🔥', level: 11, gems: 3980, members: 10, totalQuests: 51, totalXp: 17200 },
  { id: 'g3', rank: 3, name: 'Shadow Collective', avatar: '🌙', level: 10, gems: 3640, members: 9, totalQuests: 48, totalXp: 15800 },
  { id: 'g4', rank: 4, name: 'Iron Wolves', avatar: '🐺', level: 9, gems: 3310, members: 7, totalQuests: 43, totalXp: 14500 },
  { id: 'g5', rank: 5, name: 'Mystic Sages', avatar: '🔮', level: 9, gems: 3120, members: 8, totalQuests: 41, totalXp: 13800 },
  { id: 'g6', rank: 6, name: 'Storm Breakers', avatar: '⚡', level: 8, gems: 2850, members: 6, totalQuests: 37, totalXp: 12400 },
  { id: 'g7', rank: 7, name: 'Golden Lions', avatar: '🦁', level: 7, gems: 2680, members: 8, totalQuests: 34, totalXp: 11600 },
  { id: 'g8', rank: 8, name: 'Crystal Guard', avatar: '💎', level: 7, gems: 2450, members: 7, totalQuests: 31, totalXp: 10900 },
  { id: 'g9', rank: 9, name: 'Wild Hunt', avatar: '🏹', level: 6, gems: 2280, members: 6, totalQuests: 28, totalXp: 9800 },
  { id: 'g10', rank: 10, name: 'Eternal Flame', avatar: '🔥', level: 6, gems: 2120, members: 5, totalQuests: 25, totalXp: 8900 },
];

// Current user (for highlighting)
const currentUser: RankedUser = {
  id: 'current',
  rank: 42,
  username: 'You',
  avatar: '🧙',
  level: 15,
  streak: 23,
  coins: 1250,
  totalQuests: 47,
  totalXp: 3800,
};

type LeaderboardType = 'users' | 'guilds';
type UserMetric = 'streak' | 'level' | 'coins' | 'quests';
type GuildMetric = 'level' | 'gems' | 'quests';

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('users');
  const [userMetric, setUserMetric] = useState<UserMetric>('streak');
  const [guildMetric, setGuildMetric] = useState<GuildMetric>('level');

  // Sort user rankings based on selected metric
  const getSortedUsers = (): RankedUser[] => {
    const sorted = [...baseUserRankings];
    switch (userMetric) {
      case 'streak':
        sorted.sort((a, b) => b.streak - a.streak);
        break;
      case 'level':
        sorted.sort((a, b) => b.level - a.level);
        break;
      case 'coins':
        sorted.sort((a, b) => b.coins - a.coins);
        break;
      case 'quests':
        sorted.sort((a, b) => b.totalQuests - a.totalQuests);
        break;
    }
    return sorted.map((user, idx) => ({ ...user, rank: idx + 1 }));
  };

  // Sort guild rankings based on selected metric
  const getSortedGuilds = (): RankedGuild[] => {
    const sorted = [...baseGuildRankings];
    switch (guildMetric) {
      case 'level':
        sorted.sort((a, b) => b.level - a.level);
        break;
      case 'gems':
        sorted.sort((a, b) => b.gems - a.gems);
        break;
      case 'quests':
        sorted.sort((a, b) => b.totalQuests - a.totalQuests);
        break;
    }
    return sorted.map((guild, idx) => ({ ...guild, rank: idx + 1 }));
  };

  const sortedUsers = getSortedUsers();
  const sortedGuilds = getSortedGuilds();

  const formatNumber = (num: number): string => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="leaderboards">
      <div className="leaderboards__particles"></div>

      {/* Hero Banner */}
      <div className="leaderboards__hero pixel-card">
        <div className="leaderboards__hero-content">
          <h1 className="pixel-title">🏆 LEADERBOARDS 🏆</h1>
          <p className="leaderboards__hero-text">
            Who will claim the top spot? Check the legends of the realm!
          </p>
        </div>
        <div className="leaderboards__hero-stats">
          <div className="leaderboards__stat">
            <span className="leaderboards__stat-value">{baseUserRankings.length}</span>
            <span className="leaderboards__stat-label">Adventurers</span>
          </div>
          <div className="leaderboards__stat">
            <span className="leaderboards__stat-value">{baseGuildRankings.length}</span>
            <span className="leaderboards__stat-label">Guilds</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="leaderboards__tabs">
        <button
          className={`leaderboards__tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          🗡️ Adventurers
        </button>
        <button
          className={`leaderboards__tab ${activeTab === 'guilds' ? 'active' : ''}`}
          onClick={() => setActiveTab('guilds')}
        >
          🏰 Guilds
        </button>
      </div>

      {/* Metric selector (sorting only, columns remain) */}
      <div className="leaderboards__metric-selector">
        <span className="leaderboards__metric-label">🏅 Rank by:</span>
        <div className="leaderboards__metric-buttons">
          {activeTab === 'users' ? (
            <>
              <button className={`metric-btn ${userMetric === 'streak' ? 'active' : ''}`} onClick={() => setUserMetric('streak')}>🔥 Streak</button>
              <button className={`metric-btn ${userMetric === 'level' ? 'active' : ''}`} onClick={() => setUserMetric('level')}>📊 Level</button>
              <button className={`metric-btn ${userMetric === 'coins' ? 'active' : ''}`} onClick={() => setUserMetric('coins')}>💰 Coins</button>
              <button className={`metric-btn ${userMetric === 'quests' ? 'active' : ''}`} onClick={() => setUserMetric('quests')}>📜 Quests</button>
            </>
          ) : (
            <>
              <button className={`metric-btn ${guildMetric === 'level' ? 'active' : ''}`} onClick={() => setGuildMetric('level')}>📊 Level</button>
              <button className={`metric-btn ${guildMetric === 'gems' ? 'active' : ''}`} onClick={() => setGuildMetric('gems')}>💎 Gems</button>
              <button className={`metric-btn ${guildMetric === 'quests' ? 'active' : ''}`} onClick={() => setGuildMetric('quests')}>📜 Quests</button>
            </>
          )}
        </div>
      </div>

      {/* User Leaderboard */}
      {activeTab === 'users' && (
        <div className="leaderboards__content">
          <div className="leaderboards__table pixel-card">
            <div className="leaderboards__table-header">
              <div className="leaderboards__cell rank">#</div>
              <div className="leaderboards__cell player">Adventurer</div>
              <div className="leaderboards__cell level">Level</div>
              <div className="leaderboards__cell streak">🔥 Streak</div>
              <div className="leaderboards__cell coins">💰 Coins</div>
              <div className="leaderboards__cell quests">📜 Quests</div>
            </div>
            <div className="leaderboards__table-body">
              {sortedUsers.map((user) => (
                <div key={user.id} className="leaderboards__row">
                  <div className="leaderboards__cell rank">
                    <span className="rank-badge">#{user.rank}</span>
                  </div>
                  <div className="leaderboards__cell player">
                    <div className="player-info">
                      <span className="player-avatar">{user.avatar}</span>
                      <span className="player-name">{user.username}</span>
                    </div>
                  </div>
                  <div className="leaderboards__cell level">
                    <span className="level-badge">Lv.{user.level}</span>
                  </div>
                  <div className="leaderboards__cell streak">
                    <span>🔥 {user.streak}</span>
                  </div>
                  <div className="leaderboards__cell coins">
                    <span>💰 {formatNumber(user.coins)}</span>
                  </div>
                  <div className="leaderboards__cell quests">
                    <span>📜 {user.totalQuests}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current user position (if not in top 10) */}
          {currentUser.rank > 10 && (
            <div className="leaderboards__current-user pixel-card">
              <div className="leaderboards__current-user-label">⚡ YOUR POSITION ⚡</div>
              <div className="leaderboards__row is-current-user">
                <div className="leaderboards__cell rank">
                  <span className="rank-badge">#{currentUser.rank}</span>
                </div>
                <div className="leaderboards__cell player">
                  <div className="player-info">
                    <span className="player-avatar">{currentUser.avatar}</span>
                    <span className="player-name">{currentUser.username}</span>
                  </div>
                </div>
                <div className="leaderboards__cell level">
                  <span className="level-badge">Lv.{currentUser.level}</span>
                </div>
                <div className="leaderboards__cell streak">
                  <span>🔥 {currentUser.streak}</span>
                </div>
                <div className="leaderboards__cell coins">
                  <span>💰 {formatNumber(currentUser.coins)}</span>
                </div>
                <div className="leaderboards__cell quests">
                  <span>📜 {currentUser.totalQuests}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guild Leaderboard */}
      {activeTab === 'guilds' && (
        <div className="leaderboards__content">
          <div className="leaderboards__table pixel-card">
            <div className="leaderboards__table-header leaderboards__table-header--guild">
              <div className="leaderboards__cell rank">#</div>
              <div className="leaderboards__cell player">Guild</div>
              <div className="leaderboards__cell level">Level</div>
              <div className="leaderboards__cell gems">💎 Gems</div>
              <div className="leaderboards__cell members">👥 Members</div>
              <div className="leaderboards__cell quests">📜 Quests</div>
            </div>
            <div className="leaderboards__table-body">
              {sortedGuilds.map((guild) => (
                <div key={guild.id} className="leaderboards__row leaderboards__row--guild">
                  <div className="leaderboards__cell rank">
                    <span className="rank-badge">#{guild.rank}</span>
                  </div>
                  <div className="leaderboards__cell player">
                    <div className="player-info">
                      <span className="player-avatar">{guild.avatar}</span>
                      <span className="player-name">{guild.name}</span>
                    </div>
                  </div>
                  <div className="leaderboards__cell level">
                    <span className="level-badge">Lv.{guild.level}</span>
                  </div>
                  <div className="leaderboards__cell gems">
                    <span>💎 {formatNumber(guild.gems)}</span>
                  </div>
                  <div className="leaderboards__cell members">
                    <span>{guild.members}/10</span>
                  </div>
                  <div className="leaderboards__cell quests">
                    <span>📜 {guild.totalQuests}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="leaderboards__footer pixel-card">
        <span>🏆 Rankings update daily at midnight. Keep grinding, adventurer!</span>
      </div>
    </div>
  );
}
