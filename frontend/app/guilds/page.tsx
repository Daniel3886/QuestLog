'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ApiError, guildsApi } from '@/lib/api';
import { guildQuestTypeMap, trackingMap } from '@/lib/enums';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { Guild, GuildBadge, GuildQuest } from '@/lib/types';
import ErrorBanner from '@/components/ErrorBanner';
import './guilds.scss';

const availableIcons = [
  '🐉', '⚔️', '🛡️', '🏹', '🔮', '💀', '🦁', '🐺', '🦅', '🐍', '🌙', '⭐', '🔥', '💧', '🌿',
];

export default function GuildsPage() {
  const ready = useRequireAuth();
  const [guild, setGuild] = useState<Guild | null>(null);
  const [activeQuests, setActiveQuests] = useState<GuildQuest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<GuildQuest[]>([]);
  const [badges, setBadges] = useState<GuildBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [selectedQuest, setSelectedQuest] = useState<GuildQuest | null>(null);
  const [showCreateQuestModal, setShowCreateQuestModal] = useState(false);
  const [showCreateGuildModal, setShowCreateGuildModal] = useState(false);
  const [logValue, setLogValue] = useState('');
  const [logNote, setLogNote] = useState('');

  const [newGuild, setNewGuild] = useState({
    name: '',
    description: '',
    avatar: '🐉',
  });

  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    type: 'summative' as 'summative' | 'concurrent' | 'streak',
    trackingType: 'binary' as 'binary' | 'numeric' | 'timer',
    targetValue: 1,
    unit: 'times',
    rewardGems: 50,
  });

  const applyGuild = (data: Guild | null) => {
    setGuild(data);
    if (!data) {
      setActiveQuests([]);
      setCompletedQuests([]);
      setBadges([]);
      return;
    }
    setActiveQuests(data.activeQuests ?? []);
    setCompletedQuests(data.completedQuests ?? []);
    setBadges(data.badges ?? []);
  };

  const loadGuild = useCallback(async () => {
    setError('');
    try {
      const data = await guildsApi.me();
      applyGuild(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load guild');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) {
      loadGuild();
    }
  }, [ready, loadGuild]);

  const isLeader = guild?.currentUserRole === 'leader';

  const handleLogProgress = (quest: GuildQuest) => {
    setSelectedQuest(quest);
    setLogValue('');
    setLogNote('');
  };

  const submitProgress = async () => {
    if (!selectedQuest || !guild) return;
    const amount = parseFloat(logValue);
    if (Number.isNaN(amount) || amount <= 0) return;

    setSubmitting(true);
    setError('');
    try {
      await guildsApi.logProgress(
        guild.id,
        selectedQuest.id,
        amount,
        logNote || undefined,
      );
      setSelectedQuest(null);
      await loadGuild();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to log progress',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateGuild = async () => {
    if (!newGuild.name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await guildsApi.create({
        name: newGuild.name.trim(),
        description: newGuild.description.trim() || undefined,
        avatar: newGuild.avatar,
      });
      applyGuild(created);
      setShowCreateGuildModal(false);
      setNewGuild({ name: '', description: '', avatar: '🐉' });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to create guild',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateQuest = async () => {
    if (!guild || !newQuest.title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await guildsApi.createQuest(guild.id, {
        title: newQuest.title.trim(),
        description: newQuest.description.trim() || undefined,
        questType: guildQuestTypeMap[newQuest.type],
        trackingType: trackingMap[newQuest.trackingType],
        targetValue: newQuest.targetValue,
        unit: newQuest.unit,
        rewardGems: newQuest.rewardGems,
      });
      setShowCreateQuestModal(false);
      setNewQuest({
        title: '',
        description: '',
        type: 'summative',
        trackingType: 'binary',
        targetValue: 1,
        unit: 'times',
        rewardGems: 50,
      });
      await loadGuild();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to create quest',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (questId: string) => {
    if (!guild) return;
    setSubmitting(true);
    setError('');
    try {
      await guildsApi.voteQuest(guild.id, questId);
      await loadGuild();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to vote');
    } finally {
      setSubmitting(false);
    }
  };

  const getProgressPercentage = (quest: GuildQuest): number => {
    if (!quest.targetValue) return 0;
    return (quest.currentValue / quest.targetValue) * 100;
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'summative':
        return '📊';
      case 'concurrent':
        return '👥';
      case 'streak':
        return '🔥';
      default:
        return '⚔️';
    }
  };

  const getStatusBadge = (
    status: string,
  ): { text: string; color: string; icon: string } => {
    switch (status) {
      case 'drafting':
        return { text: 'VOTING', color: 'var(--pixel-gold)', icon: '🗳️' };
      case 'active':
        return { text: 'ACTIVE', color: 'var(--pixel-success)', icon: '⚔️' };
      case 'completed':
        return {
          text: 'COMPLETED',
          color: 'var(--pixel-secondary)',
          icon: '🏆',
        };
      case 'failed':
        return { text: 'FAILED', color: 'var(--pixel-primary)', icon: '💀' };
      default:
        return { text: 'ACTIVE', color: 'var(--pixel-success)', icon: '⚔️' };
    }
  };

  const getXpPercentage = () => {
    if (!guild || !guild.xpNext) return 0;
    return (guild.xp / guild.xpNext) * 100;
  };

  if (!ready || loading) {
    return (
      <div className="guilds">
        <p>Loading guild hall...</p>
      </div>
    );
  }

  if (!guild) {
    return (
      <div className="guilds">
        <ErrorBanner message={error} onDismiss={() => setError('')} />
        <div className="guilds__empty pixel-card">
          <div className="guilds__empty-icon">⚔️</div>
          <h2>No Guild Yet</h2>
          <p>Create or join a guild to start your cooperative adventure!</p>
          <button
            type="button"
            className="pixel-btn"
            onClick={() => setShowCreateGuildModal(true)}
          >
            Create Guild
          </button>
        </div>

        {showCreateGuildModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowCreateGuildModal(false)}
          >
            <div
              className="modal pixel-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal__header">
                <h3>⚔️ Create New Guild</h3>
                <button
                  type="button"
                  className="modal__close"
                  onClick={() => setShowCreateGuildModal(false)}
                >
                  ✖
                </button>
              </div>
              <div className="modal__body">
                <div className="modal__field">
                  <label>Guild Name:</label>
                  <input
                    type="text"
                    value={newGuild.name}
                    onChange={(e) =>
                      setNewGuild({ ...newGuild, name: e.target.value })
                    }
                    placeholder="e.g., Dragon Slayers"
                    className="pixel-input"
                  />
                </div>
                <div className="modal__field">
                  <label>Description:</label>
                  <textarea
                    value={newGuild.description}
                    onChange={(e) =>
                      setNewGuild({ ...newGuild, description: e.target.value })
                    }
                    placeholder="What is your guild about?"
                    className="pixel-input pixel-input--textarea"
                    rows={2}
                  />
                </div>
                <div className="modal__field">
                  <label>Guild Icon:</label>
                  <div className="modal__icon-grid">
                    {availableIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`modal__icon-btn ${newGuild.avatar === icon ? 'active' : ''}`}
                        onClick={() => setNewGuild({ ...newGuild, avatar: icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal__footer">
                <button
                  type="button"
                  className="pixel-btn"
                  onClick={handleCreateGuild}
                  disabled={!newGuild.name.trim() || submitting}
                >
                  {submitting ? 'Creating...' : 'Create Guild'}
                </button>
                <button
                  type="button"
                  className="pixel-btn pixel-btn--secondary"
                  onClick={() => setShowCreateGuildModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="guilds">
      <div className="guilds__particles"></div>
      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <div className="guilds__header pixel-card">
        <div className="guilds__avatar">{guild.avatar}</div>
        <div className="guilds__info">
          <div className="guilds__name-row">
            <h1>{guild.name}</h1>
            <span className="guilds__level">Lv.{guild.level}</span>
          </div>
          <p className="guilds__description">{guild.description}</p>
          <div className="guilds__stats">
            <div className="guilds__stat">
              <span>💎 {guild.gems} gems</span>
              <span>👥 {guild.members.length}/10 members</span>
              <span>
                📅 Founded {new Date(guild.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="guilds__xp-bar">
              <div
                className="guilds__xp-fill"
                style={{ width: `${getXpPercentage()}%` }}
              ></div>
              <span className="guilds__xp-text">
                {guild.xp}/{guild.xpNext} XP
              </span>
            </div>
          </div>
        </div>
        {isLeader && (
          <button
            type="button"
            className="pixel-btn"
            onClick={() => setShowCreateQuestModal(true)}
          >
            + Create Quest
          </button>
        )}
      </div>

      <div className="guilds__hall">
        <div className="guilds__left">
          <section className="guilds__section">
            <h2 className="pixel-heading">👥 GUILD MEMBERS 👥</h2>
            <div className="guilds__members">
              {guild.members.map((member) => (
                <div key={member.id} className="member-card pixel-card">
                  <div className="member-card__avatar">{member.avatar}</div>
                  <div className="member-card__info">
                    <div className="member-card__name-row">
                      <span className="member-card__name">
                        {member.username}
                      </span>
                      {member.role === 'leader' && (
                        <span className="member-card__role">👑 LEADER</span>
                      )}
                    </div>
                    <div className="member-card__stats">
                      <span>🔥 {member.streak} day streak</span>
                      <span>📊 {member.contribution} pts</span>
                      <span>
                        📅 Joined{' '}
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="guilds__section">
            <h2 className="pixel-heading">🏅 GUILD BADGES 🏅</h2>
            <div className="guilds__badges">
              {badges.length === 0 && (
                <p className="guilds__empty-quests">No badges earned yet.</p>
              )}
              {badges.map((badge) => (
                <div key={badge.id} className="badge-card pixel-card">
                  <div className="badge-card__icon">{badge.icon}</div>
                  <div className="badge-card__info">
                    <span className="badge-card__name">{badge.name}</span>
                    <span className="badge-card__desc">{badge.description}</span>
                    <span className="badge-card__date">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="guilds__right">
          <section className="guilds__section">
            <h2 className="pixel-heading">⚔️ ACTIVE QUESTS ⚔️</h2>
            <div className="guilds__quests">
              {activeQuests.length === 0 && (
                <div className="guilds__empty-quests pixel-card">
                  <span>
                    No active quests. Create one to start your adventure!
                  </span>
                </div>
              )}
              {activeQuests.map((quest) => {
                const status = getStatusBadge(quest.status);
                const progress = getProgressPercentage(quest);
                return (
                  <div key={quest.id} className="quest-card pixel-card">
                    <div className="quest-card__icon">
                      {getTypeIcon(quest.type)}
                    </div>
                    <div className="quest-card__content">
                      <div className="quest-card__header">
                        <h3>{quest.title}</h3>
                        <span
                          className="quest-card__status"
                          style={{ color: status.color }}
                        >
                          {status.icon} {status.text}
                        </span>
                      </div>
                      <p className="quest-card__description">
                        {quest.description}
                      </p>

                      {quest.status === 'drafting' && (
                        <div className="quest-card__voting">
                          <span>
                            🗳️ Voting: {quest.votes}/{quest.totalMembers}{' '}
                            votes (all members must vote to activate)
                          </span>
                          <button
                            type="button"
                            className="pixel-btn pixel-btn--small"
                            onClick={() => handleVote(quest.id)}
                            disabled={submitting}
                          >
                            ✅ Vote to approve
                          </button>
                        </div>
                      )}

                      {quest.status === 'active' && (
                        <>
                          <div className="quest-card__progress">
                            <div className="quest-card__progress-bar">
                              <div
                                className="quest-card__progress-fill"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <div className="quest-card__progress-stats">
                              <span>
                                {quest.currentValue} / {quest.targetValue}{' '}
                                {quest.unit}
                              </span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                          </div>
                          <div className="quest-card__details">
                            <span>
                              ⏰ Ends{' '}
                              {quest.endDate
                                ? new Date(quest.endDate).toLocaleDateString()
                                : 'TBD'}
                            </span>
                            <span>
                              💎 {quest.rewardGems} gems
                              {quest.rewardItemName
                                ? ` + ${quest.rewardItemName}`
                                : ''}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="pixel-btn pixel-btn--small"
                            onClick={() => handleLogProgress(quest)}
                          >
                            Log Progress
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {completedQuests.length > 0 && (
            <section className="guilds__section">
              <h2 className="pixel-heading">📜 COMPLETED QUESTS 📜</h2>
              <div className="guilds__quests">
                {completedQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className="quest-card quest-card--completed pixel-card"
                  >
                    <div className="quest-card__icon">🏆</div>
                    <div className="quest-card__content">
                      <div className="quest-card__header">
                        <h3>{quest.title}</h3>
                        <span
                          className="quest-card__status"
                          style={{ color: 'var(--pixel-secondary)' }}
                        >
                          COMPLETED
                        </span>
                      </div>
                      <p className="quest-card__description">
                        {quest.description}
                      </p>
                      <div className="quest-card__reward">
                        <span>
                          🎉 Earned: {quest.rewardGems} gems
                          {quest.rewardItemName
                            ? ` + ${quest.rewardItemName}`
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {selectedQuest && (
        <div className="modal-overlay" onClick={() => setSelectedQuest(null)}>
          <div
            className="modal pixel-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3>Log Guild Progress</h3>
              <button
                type="button"
                className="modal__close"
                onClick={() => setSelectedQuest(null)}
              >
                ✖
              </button>
            </div>
            <div className="modal__body">
              <p>
                <strong>{selectedQuest.title}</strong>
              </p>
              <div className="modal__field">
                <label>Amount ({selectedQuest.unit}):</label>
                <input
                  type="number"
                  value={logValue}
                  onChange={(e) => setLogValue(e.target.value)}
                  placeholder={`Enter ${selectedQuest.unit}`}
                  className="pixel-input"
                />
              </div>
              <div className="modal__field">
                <label>Note (optional):</label>
                <textarea
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  placeholder="How did you contribute?"
                  className="pixel-input pixel-input--textarea"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal__footer">
              <button
                type="button"
                className="pixel-btn"
                onClick={submitProgress}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Progress'}
              </button>
              <button
                type="button"
                className="pixel-btn pixel-btn--secondary"
                onClick={() => setSelectedQuest(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateQuestModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateQuestModal(false)}
        >
          <div
            className="modal modal--large pixel-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3>⚔️ Create Guild Quest</h3>
              <button
                type="button"
                className="modal__close"
                onClick={() => setShowCreateQuestModal(false)}
              >
                ✖
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__field">
                <label>Quest Title:</label>
                <input
                  type="text"
                  value={newQuest.title}
                  onChange={(e) =>
                    setNewQuest({ ...newQuest, title: e.target.value })
                  }
                  placeholder="e.g., Weekly Running Challenge"
                  className="pixel-input"
                />
              </div>
              <div className="modal__field">
                <label>Description:</label>
                <textarea
                  value={newQuest.description}
                  onChange={(e) =>
                    setNewQuest({ ...newQuest, description: e.target.value })
                  }
                  placeholder="Describe the challenge..."
                  className="pixel-input pixel-input--textarea"
                  rows={2}
                />
              </div>
              <div className="modal__row">
                <div className="modal__field">
                  <label>Quest Type:</label>
                  <select
                    value={newQuest.type}
                    onChange={(e) =>
                      setNewQuest({
                        ...newQuest,
                        type: e.target.value as typeof newQuest.type,
                      })
                    }
                    className="pixel-input"
                  >
                    <option value="summative">Summative (total combined)</option>
                    <option value="concurrent">Concurrent (all members)</option>
                    <option value="streak">Streak (maintain daily)</option>
                  </select>
                </div>
                <div className="modal__field">
                  <label>Tracking Type:</label>
                  <select
                    value={newQuest.trackingType}
                    onChange={(e) =>
                      setNewQuest({
                        ...newQuest,
                        trackingType: e.target
                          .value as typeof newQuest.trackingType,
                      })
                    }
                    className="pixel-input"
                  >
                    <option value="binary">Yes/No</option>
                    <option value="numeric">Numeric</option>
                    <option value="timer">Timer</option>
                  </select>
                </div>
              </div>
              <div className="modal__row">
                <div className="modal__field">
                  <label>Target Value:</label>
                  <input
                    type="number"
                    value={newQuest.targetValue}
                    onChange={(e) =>
                      setNewQuest({
                        ...newQuest,
                        targetValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="pixel-input"
                  />
                </div>
                <div className="modal__field">
                  <label>Unit:</label>
                  <input
                    type="text"
                    value={newQuest.unit}
                    onChange={(e) =>
                      setNewQuest({ ...newQuest, unit: e.target.value })
                    }
                    placeholder="km, days, workouts"
                    className="pixel-input"
                  />
                </div>
                <div className="modal__field">
                  <label>Reward Gems:</label>
                  <input
                    type="number"
                    value={newQuest.rewardGems}
                    onChange={(e) =>
                      setNewQuest({
                        ...newQuest,
                        rewardGems: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="pixel-input"
                  />
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button
                type="button"
                className="pixel-btn"
                onClick={handleCreateQuest}
                disabled={!newQuest.title.trim() || submitting}
              >
                {submitting ? 'Creating...' : 'Create Quest'}
              </button>
              <button
                type="button"
                className="pixel-btn pixel-btn--secondary"
                onClick={() => setShowCreateQuestModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
