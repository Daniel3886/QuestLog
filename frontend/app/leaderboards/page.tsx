'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ApiError, leaderboardsApi } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';
import type { RankedGuild, RankedUser } from '@/lib/types';
import ErrorBanner from '@/components/ErrorBanner';
import './leaderboards.scss';

type LeaderboardType = 'users' | 'guilds';
type UserMetric = 'streak' | 'level' | 'coins' | 'quests';
type GuildMetric = 'level' | 'gems' | 'quests';

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('users');
  const [userMetric, setUserMetric] = useState<UserMetric>('streak');
  const [guildMetric, setGuildMetric] = useState<GuildMetric>('level');
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [guilds, setGuilds] = useState<RankedGuild[]>([]);
  const [myRank, setMyRank] = useState<RankedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [userRows, guildRows] = await Promise.all([
        leaderboardsApi.users(userMetric),
        leaderboardsApi.guilds(guildMetric),
      ]);
      setUsers(userRows);
      setGuilds(guildRows);

      if (isLoggedIn()) {
        const me = await leaderboardsApi.myRank(userMetric);
        setMyRank(me);
      } else {
        setMyRank(null);
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to load leaderboards',
      );
    } finally {
      setLoading(false);
    }
  }, [userMetric, guildMetric]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const showMyRank =
    myRank && myRank.rank > 10 && !users.some((u) => u.id === myRank.id);

  if (loading) {
    return <div className="leaderboards"><p>Loading rankings...</p></div>;
  }

  return (
    <div className="leaderboards">
      <div className="leaderboards__particles"></div>
      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <div className="leaderboards__hero pixel-card">
        <div className="leaderboards__hero-content">
          <h1 className="pixel-title">🏆 LEADERBOARDS 🏆</h1>
          <p className="leaderboards__hero-text">
            Who will claim the top spot? Check the legends of the realm!
          </p>
        </div>
        <div className="leaderboards__hero-stats">
          <div className="leaderboards__stat">
            <span className="leaderboards__stat-value">{users.length}</span>
            <span className="leaderboards__stat-label">Adventurers</span>
          </div>
          <div className="leaderboards__stat">
            <span className="leaderboards__stat-value">{guilds.length}</span>
            <span className="leaderboards__stat-label">Guilds</span>
          </div>
        </div>
      </div>

      <div className="leaderboards__tabs">
        <button
          type="button"
          className={`leaderboards__tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          🗡️ Adventurers
        </button>
        <button
          type="button"
          className={`leaderboards__tab ${activeTab === 'guilds' ? 'active' : ''}`}
          onClick={() => setActiveTab('guilds')}
        >
          🏰 Guilds
        </button>
      </div>

      <div className="leaderboards__metric-selector">
        <span className="leaderboards__metric-label">🏅 Rank by:</span>
        <div className="leaderboards__metric-buttons">
          {activeTab === 'users' ? (
            <>
              {(
                [
                  ['streak', '🔥 Streak'],
                  ['level', '📊 Level'],
                  ['coins', '💰 Coins'],
                  ['quests', '📜 Quests'],
                ] as const
              ).map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  className={`metric-btn ${userMetric === m ? 'active' : ''}`}
                  onClick={() => {
                    setLoading(true);
                    setUserMetric(m);
                  }}
                >
                  {label}
                </button>
              ))}
            </>
          ) : (
            <>
              {(
                [
                  ['level', '📊 Level'],
                  ['gems', '💎 Gems'],
                  ['quests', '📜 Quests'],
                ] as const
              ).map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  className={`metric-btn ${guildMetric === m ? 'active' : ''}`}
                  onClick={() => {
                    setLoading(true);
                    setGuildMetric(m);
                  }}
                >
                  {label}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

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
              {users.map((user) => (
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

          {showMyRank && myRank && (
            <div className="leaderboards__current-user pixel-card">
              <div className="leaderboards__current-user-label">
                ⚡ YOUR POSITION ⚡
              </div>
              <div className="leaderboards__row is-current-user">
                <div className="leaderboards__cell rank">
                  <span className="rank-badge">#{myRank.rank}</span>
                </div>
                <div className="leaderboards__cell player">
                  <div className="player-info">
                    <span className="player-avatar">{myRank.avatar}</span>
                    <span className="player-name">{myRank.username}</span>
                  </div>
                </div>
                <div className="leaderboards__cell level">
                  <span className="level-badge">Lv.{myRank.level}</span>
                </div>
                <div className="leaderboards__cell streak">
                  <span>🔥 {myRank.streak}</span>
                </div>
                <div className="leaderboards__cell coins">
                  <span>💰 {formatNumber(myRank.coins)}</span>
                </div>
                <div className="leaderboards__cell quests">
                  <span>📜 {myRank.totalQuests}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
              {guilds.map((guild) => (
                <div
                  key={guild.id}
                  className="leaderboards__row leaderboards__row--guild"
                >
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

      <div className="leaderboards__footer pixel-card">
        <span>🏆 Rankings update when you complete quests and events.</span>
      </div>
    </div>
  );
}
