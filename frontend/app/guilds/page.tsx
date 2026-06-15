'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ApiError, guildsApi } from '@/lib/api';
import { guildQuestTypeMap, trackingMap } from '@/lib/enums';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { Guild, GuildBadge, GuildQuest, GuildSummary } from '@/lib/types';
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

  // UI state for modals
  const [selectedQuest, setSelectedQuest] = useState<GuildQuest | null>(null);
  const [showCreateQuestModal, setShowCreateQuestModal] = useState(false);
  const [showCreateGuildModal, setShowCreateGuildModal] = useState(false);
  const [showEditGuildModal, setShowEditGuildModal] = useState(false);
  const [showBrowseGuilds, setShowBrowseGuilds] = useState(false);
  const [viewingGuild, setViewingGuild] = useState<Guild | null>(null);
  const [allGuilds, setAllGuilds] = useState<GuildSummary[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [transferLeaderId, setTransferLeaderId] = useState('');

  // Form states
  const [logValue, setLogValue] = useState('');
  const [logNote, setLogNote] = useState('');
  const [newGuild, setNewGuild] = useState({ name: '', description: '', avatar: '🐉' });
  const [editGuild, setEditGuild] = useState({ name: '', description: '', avatar: '' });
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    type: 'summative' as const,
    trackingType: 'binary' as const,
    targetValue: 1,
    unit: 'times',
    rewardGems: 50,
  });

  // Load guild data
  const loadGuild = useCallback(async () => {
    setError('');
    try {
      const data = await guildsApi.me();
      setGuild(data);
      if (data) {
        setActiveQuests(data.activeQuests ?? []);
        setCompletedQuests(data.completedQuests ?? []);
        setBadges(data.badges ?? []);
      } else {
        setActiveQuests([]);
        setCompletedQuests([]);
        setBadges([]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) loadGuild();
  }, [ready, loadGuild]);

  const isLeader = guild?.currentUserRole === 'leader';

  // ----- Invite member -----
  const handleInvite = async () => {
    if (!guild || !inviteEmail.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await guildsApi.invite(guild.id, inviteEmail.trim());
      setInviteEmail('');
      setError('Invitation sent!');
      setTimeout(() => setError(''), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invitation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ----- Leave guild -----
  const handleLeave = async () => {
    if (!guild) return;
    if (!window.confirm('Are you sure you want to leave this guild?')) return;
    setSubmitting(true);
    try {
      await guildsApi.leave(guild.id);
      await loadGuild();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to leave guild');
    } finally {
      setSubmitting(false);
    }
  };

  // ----- Remove member (leader only) -----
  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!guild) return;
    if (!window.confirm(`Remove ${userName} from the guild?`)) return;
    setSubmitting(true);
    try {
      await guildsApi.removeMember(guild.id, userId);
      await loadGuild();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to remove member');
    } finally {
      setSubmitting(false);
    }
  };

  // ----- Edit guild info (leader only) -----
  const openEditModal = () => {
    if (!guild) return;
    setEditGuild({
      name: guild.name,
      description: guild.description || '',
      avatar: guild.avatar,
    });
    setShowEditGuildModal(true);
  };

  const handleUpdateGuild = async () => {
    if (!guild) return;
    setSubmitting(true);
    try {
      await guildsApi.update(guild.id, {
        name: editGuild.name !== guild.name ? editGuild.name : undefined,
        description: editGuild.description !== guild.description ? editGuild.description : undefined,
        avatar: editGuild.avatar !== guild.avatar ? editGuild.avatar : undefined,
      });
      await loadGuild();
      setShowEditGuildModal(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ----- Transfer leadership (leader only) -----
  const handleTransferLeadership = async () => {
    if (!guild || !transferLeaderId) return;
    if (!window.confirm('Transfer leadership to the selected member?')) return;
    setSubmitting(true);
    try {
      await guildsApi.transferLeadership(guild.id, transferLeaderId);
      await loadGuild();
      setShowEditGuildModal(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ----- Delete guild (leader only) -----
  const handleDeleteGuild = async () => {
    if (!guild) return;
    if (!window.confirm('⚠️ Delete the guild? This action cannot be undone.')) return;
    if (!window.confirm('Are you absolutely sure? All data will be lost.')) return;
    setSubmitting(true);
    try {
      await guildsApi.delete(guild.id);
      await loadGuild(); // will set guild to null
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Deletion failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ----- Browse all guilds -----
  const loadAllGuilds = async () => {
    setSubmitting(true);
    try {
      const guilds = await guildsApi.listAll();
      setAllGuilds(guilds);
      setShowBrowseGuilds(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load guilds');
    } finally {
      setSubmitting(false);
    }
  };

  const viewGuildDetails = async (guildId: string) => {
    try {
      const data = await guildsApi.getPublic(guildId);
      setViewingGuild(data);
    } catch (err) {
      setError('Failed to load guild details');
    }
  };

  // ----- Quest actions (unchanged) -----
  const handleLogProgress = (quest: GuildQuest) => {
    setSelectedQuest(quest);
    setLogValue('');
    setLogNote('');
  };

  const submitProgress = async () => {
    if (!selectedQuest || !guild) return;
    const amount = parseFloat(logValue);
    if (isNaN(amount) || amount <= 0) return;
    setSubmitting(true);
    try {
      await guildsApi.logProgress(guild.id, selectedQuest.id, amount, logNote || undefined);
      setSelectedQuest(null);
      await loadGuild();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to log progress');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateGuild = async () => {
    if (!newGuild.name.trim()) return;
    setSubmitting(true);
    try {
      const created = await guildsApi.create({
        name: newGuild.name.trim(),
        description: newGuild.description.trim() || undefined,
        avatar: newGuild.avatar,
      });
      setGuild(created);
      setShowCreateGuildModal(false);
      setNewGuild({ name: '', description: '', avatar: '🐉' });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create guild');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateQuest = async () => {
    if (!guild || !newQuest.title.trim()) return;
    setSubmitting(true);
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
      setError(err instanceof ApiError ? err.message : 'Failed to create quest');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (questId: string) => {
    if (!guild) return;
    setSubmitting(true);
    try {
      await guildsApi.voteQuest(guild.id, questId);
      await loadGuild();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to vote');
    } finally {
      setSubmitting(false);
    }
  };

  // Helpers
  const getProgressPercentage = (quest: GuildQuest) => (quest.targetValue ? (quest.currentValue / quest.targetValue) * 100 : 0);
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'summative': return '📊';
      case 'concurrent': return '👥';
      case 'streak': return '🔥';
      default: return '⚔️';
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'drafting': return { text: 'VOTING', color: 'var(--pixel-gold)', icon: '🗳️' };
      case 'active': return { text: 'ACTIVE', color: 'var(--pixel-success)', icon: '⚔️' };
      case 'completed': return { text: 'COMPLETED', color: 'var(--pixel-secondary)', icon: '🏆' };
      case 'failed': return { text: 'FAILED', color: 'var(--pixel-primary)', icon: '💀' };
      default: return { text: 'ACTIVE', color: 'var(--pixel-success)', icon: '⚔️' };
    }
  };
  const getXpPercentage = () => {
    if (!guild || !guild.xpNext) return 0;
    return (guild.xp / guild.xpNext) * 100;
  };

  // Loading / no guild
  if (!ready || loading) return <div className="guilds"><p>Loading guild hall...</p></div>;
  if (!guild) {
    return (
      <div className="guilds">
        <ErrorBanner message={error} onDismiss={() => setError('')} />
        <div className="guilds__empty pixel-card">
          <div className="guilds__empty-icon">⚔️</div>
          <h2>No Guild Yet</h2>
          <p>Create or join a guild to start your cooperative adventure!</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="pixel-btn" onClick={() => setShowCreateGuildModal(true)}>Create Guild</button>
            <button className="pixel-btn pixel-btn--secondary" onClick={loadAllGuilds}>Browse Guilds</button>
          </div>
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
        {/* Browse Guilds Modal */}
      {showBrowseGuilds && (
        <div className="modal-overlay" onClick={() => setShowBrowseGuilds(false)}>
          <div className="modal pixel-card modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>All Guilds</h3>
              <button className="modal__close" onClick={() => setShowBrowseGuilds(false)}>✖</button>
            </div>
            <div className="modal__body">
              <div className="guilds__browse-list">
                {allGuilds.map(g => (
                  <div key={g.id} className="guild-browse-item pixel-card">
                    <div className="guild-browse-avatar">{g.avatar}</div>
                    <div className="guild-browse-info">
                      <h4>{g.name}</h4>
                      <p>{g.description}</p>
                      <span>👥 {g.memberCount} members • Lv.{g.level}</span>
                    </div>
                    <button className="pixel-btn pixel-btn--small" onClick={() => viewGuildDetails(g.id)}>Show</button>
                    <button className="pixel-btn pixel-btn--small pixel-btn--secondary"
                    onClick={async () => {
                      try {
                        await guildsApi.join(g.id);
                        await loadGuild();
                        setShowBrowseGuilds(false);
                      } catch (err) {
                        setError(err instanceof ApiError ? err.message : 'Failed to join guild');
                      }
                    }}
                  >
                    Join Guild
                  </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* View Guild Details Modal (read‑only) */}
      {viewingGuild && (
        <div className="modal-overlay" onClick={() => setViewingGuild(null)}>
          <div className="modal pixel-card modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{viewingGuild.name}</h3>
              <button className="modal__close" onClick={() => setViewingGuild(null)}>✖</button>
            </div>
            <div className="modal__body guild-view-modal">
              <div className="guild-view-header">
                <div className="guild-view-avatar">{viewingGuild.avatar}</div>
                <div className="guild-view-info">
                  <p><strong>Description:</strong> {viewingGuild.description}</p>
                  <p><strong>Level:</strong> {viewingGuild.level} • <strong>Gems:</strong> {viewingGuild.gems}</p>
                  <p><strong>Members:</strong> {viewingGuild.members.length}/10</p>
                </div>
              </div>
              <h4>Members</h4>
              <div className="guild-view-members">
                {viewingGuild.members.map(m => (
                  <div key={m.id} className="guild-view-member">
                    <span>{m.avatar} {m.username}</span>
                    {m.role === 'leader' && <span className="member-card__role">Leader</span>}
                  </div>
                ))}
              </div>
              <h4>Recent Badges</h4>
              <div className="guild-view-badges">
                {viewingGuild.badges?.slice(0, 5).map(b => (
                  <div key={b.id}><span>{b.icon}</span> {b.name}</div>
                ))}
              </div>
              <h4>Active Quests</h4>
              <div className="guild-view-quests">
                {viewingGuild.activeQuests?.slice(0, 3).map(q => (
                  <div key={q.id}>⚔️ {q.title}</div>
                ))}
              </div>
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
              <span>📅 Founded {new Date(guild.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="guilds__xp-bar">
              <div className="guilds__xp-fill" style={{ width: `${getXpPercentage()}%` }}></div>
              <span className="guilds__xp-text">{guild.xp}/{guild.xpNext} XP</span>
            </div>
          </div>
        </div>
        <div className="guilds__actions">
          {isLeader && (
            <>
              <button className="pixel-btn" onClick={() => setShowCreateQuestModal(true)}>+ Quest</button><br />
              <button className="pixel-btn pixel-btn--secondary" onClick={openEditModal}>⚙️ Edit</button>
              <button className="pixel-btn pixel-btn--secondary" onClick={handleDeleteGuild}>🗑️ Delete</button><br />
            </>
          )}
          {!isLeader && <button className="pixel-btn" onClick={async () => { await handleLeave(); await loadGuild(); }}>Leave Guild</button>}
          {/* <button className="pixel-btn pixel-btn--small" onClick={loadAllGuilds}>🔍 Browse Guilds</button> */}
        </div>
      </div>

      {isLeader && (
        <div className="guilds__invite pixel-card">
          <h3>Invite Member</h3>
          <div className="guilds__invite-form">
            <input
              type="email"
              placeholder="friend@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="pixel-input"
            />
            <button className="pixel-btn" onClick={handleInvite} disabled={submitting || !inviteEmail.trim()}>
              Send Invitation
            </button>
          </div>
        </div>
      )}

      <div className="guilds__hall">
        {/* Left column: Members & Badges */}
        <div className="guilds__left">
          <section className="guilds__section">
            <h2 className="pixel-heading">👥 GUILD MEMBERS 👥</h2>
            <div className="guilds__members">
              {guild.members.map((member) => (
                <div key={member.id} className="member-card pixel-card">
                  <div className="member-card__avatar">{member.avatar}</div>
                  <div className="member-card__info">
                    <div className="member-card__name-row">
                      <span className="member-card__name">{member.username}</span>
                      {member.role === 'leader' && <span className="member-card__role">👑 LEADER</span>}
                    </div>
                    <div className="member-card__stats">
                      <span>🔥 {member.streak} day streak</span>
                      <span>📊 {member.contribution} pts</span>
                      <span>📅 Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                    </div>
                    {isLeader && member.role !== 'leader' && (
                      <div className="member-card__actions">
                        <button
                          className="pixel-btn pixel-btn--small"
                          onClick={() => handleRemoveMember(member.userId, member.username)}
                          disabled={submitting}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="guilds__section">
            <h2 className="pixel-heading">🏅 GUILD BADGES 🏅</h2>
            <div className="guilds__badges">
              {badges.length === 0 && <p>No badges earned yet.</p>}
              {badges.map((badge) => (
                <div key={badge.id} className="badge-card pixel-card">
                  <div className="badge-card__icon">{badge.icon}</div>
                  <div className="badge-card__info">
                    <span className="badge-card__name">{badge.name}</span>
                    <span className="badge-card__desc">{badge.description}</span>
                    <span className="badge-card__date">Earned {new Date(badge.earnedAt).toLocaleDateString()}</span>
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

      {/* Edit Guild Modal (leader only) */}
      {showEditGuildModal && (
        <div className="modal-overlay" onClick={() => setShowEditGuildModal(false)}>
          <div className="modal pixel-card modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Edit Guild</h3>
              <button className="modal__close" onClick={() => setShowEditGuildModal(false)}>✖</button>
            </div>
            <div className="modal__body">
              <div className="modal__field">
                <label>Guild Name</label>
                <input type="text" value={editGuild.name} onChange={(e) => setEditGuild({ ...editGuild, name: e.target.value })} className="pixel-input" />
              </div>
              <div className="modal__field">
                <label>Description</label>
                <textarea value={editGuild.description} onChange={(e) => setEditGuild({ ...editGuild, description: e.target.value })} className="pixel-input pixel-input--textarea" rows={2} />
              </div>
              <div className="modal__field">
                <label>Icon</label>
                <div className="modal__icon-grid">
                  {availableIcons.map(icon => (
                    <button key={icon} type="button" className={`modal__icon-btn ${editGuild.avatar === icon ? 'active' : ''}`} onClick={() => setEditGuild({ ...editGuild, avatar: icon })}>{icon}</button>
                  ))}
                </div>
              </div>
              <hr />
              <div className="modal__field">
                <label>Transfer Leadership (optional)</label>
                <select value={transferLeaderId} onChange={(e) => setTransferLeaderId(e.target.value)} className="pixel-input">
                  <option value="">Select new leader</option>
                  {guild.members.filter(m => m.role !== 'leader').map(m => (
                    <option key={m.userId} value={m.userId}>{m.username}</option>
                  ))}
                </select>
                <button className="pixel-btn pixel-btn--small" onClick={handleTransferLeadership} disabled={!transferLeaderId || submitting}>Transfer</button>
              </div>
            </div>
            <div className="modal__footer">
              <button className="pixel-btn" onClick={handleUpdateGuild} disabled={submitting}>Save Changes</button>
              <button className="pixel-btn pixel-btn--secondary" onClick={() => setShowEditGuildModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 
      {showBrowseGuilds && (
        <div className="modal-overlay" onClick={() => setShowBrowseGuilds(false)}>
          <div className="modal pixel-card modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>All Guilds</h3>
              <button className="modal__close" onClick={() => setShowBrowseGuilds(false)}>✖</button>
            </div>
            <div className="modal__body">
              <div className="guilds__browse-list">
                {allGuilds.map(g => (
                  <div key={g.id} className="guild-browse-item pixel-card">
                    <div className="guild-browse-avatar">{g.avatar}</div>
                    <div className="guild-browse-info">
                      <h4>{g.name}</h4>
                      <p>{g.description}</p>
                      <span>👥 {g.memberCount} members • Lv.{g.level}</span>
                    </div>
                    <button className="pixel-btn pixel-btn--small" onClick={() => viewGuildDetails(g.id)}>Show</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingGuild && (
        <div className="modal-overlay" onClick={() => setViewingGuild(null)}>
          <div className="modal pixel-card modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{viewingGuild.name}</h3>
              <button className="modal__close" onClick={() => setViewingGuild(null)}>✖</button>
            </div>
            <div className="modal__body guild-view-modal">
              <div className="guild-view-header">
                <div className="guild-view-avatar">{viewingGuild.avatar}</div>
                <div className="guild-view-info">
                  <p><strong>Description:</strong> {viewingGuild.description}</p>
                  <p><strong>Level:</strong> {viewingGuild.level} • <strong>Gems:</strong> {viewingGuild.gems}</p>
                  <p><strong>Members:</strong> {viewingGuild.members.length}/10</p>
                </div>
              </div>
              <h4>Members</h4>
              <div className="guild-view-members">
                {viewingGuild.members.map(m => (
                  <div key={m.id} className="guild-view-member">
                    <span>{m.avatar} {m.username}</span>
                    {m.role === 'leader' && <span className="member-card__role">Leader</span>}
                  </div>
                ))}
              </div>
              <h4>Recent Badges</h4>
              <div className="guild-view-badges">
                {viewingGuild.badges?.slice(0, 5).map(b => (
                  <div key={b.id}><span>{b.icon}</span> {b.name}</div>
                ))}
              </div>
              <h4>Active Quests</h4>
              <div className="guild-view-quests">
                {viewingGuild.activeQuests?.slice(0, 3).map(q => (
                  <div key={q.id}>⚔️ {q.title}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )} */}

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
