// app/guilds/page.tsx
"use client";

import React, { useState } from 'react';
import './guilds.scss';

// Types
interface Guild {
  id: string;
  name: string;
  description: string;
  avatar: string;
  level: number;
  xp: number;
  xpNext: number;
  gems: number;
  members: GuildMember[];
  createdAt: string;
}

interface GuildMember {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  role: 'leader' | 'member';
  joinedAt: string;
  contribution: number;
  streak: number;
}

interface GuildQuest {
  id: string;
  title: string;
  description: string;
  type: 'summative' | 'concurrent' | 'streak';
  trackingType: 'binary' | 'numeric' | 'timer';
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'drafting' | 'active' | 'completed' | 'failed';
  votes: number;
  totalMembers: number;
  startDate: string | null;
  endDate: string | null;
  rewardGems: number;
  rewardItemName: string;
  createdBy: string;
  createdAt: string;
}

interface GuildBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

// Mock data - User's current guild
const mockMyGuild: Guild = {
  id: 'guild-1',
  name: 'Dragon Slayers',
  description: 'We rise by lifting others. Daily runners and fitness enthusiasts!',
  avatar: '🐉',
  level: 5,
  xp: 3420,
  xpNext: 5000,
  gems: 1250,
  members: [
    {
      id: 'm1',
      userId: 'u1',
      username: 'ShadowBlade',
      avatar: '🗡️',
      role: 'leader',
      joinedAt: '2025-01-15',
      contribution: 2840,
      streak: 23,
    },
    {
      id: 'm2',
      userId: 'u2',
      username: 'MageLena',
      avatar: '✨',
      role: 'member',
      joinedAt: '2025-01-20',
      contribution: 2150,
      streak: 18,
    },
    {
      id: 'm3',
      userId: 'u3',
      username: 'HealerAmy',
      avatar: '💚',
      role: 'member',
      joinedAt: '2025-01-22',
      contribution: 1980,
      streak: 15,
    },
    {
      id: 'm4',
      userId: 'u4',
      username: 'RogueX',
      avatar: '🗡️',
      role: 'member',
      joinedAt: '2025-02-01',
      contribution: 1250,
      streak: 10,
    },
    {
      id: 'm5',
      userId: 'u5',
      username: 'BerserkKarl',
      avatar: '⚡',
      role: 'member',
      joinedAt: '2025-02-10',
      contribution: 890,
      streak: 7,
    },
  ],
  createdAt: '2025-01-15',
};

const mockGuildQuests: GuildQuest[] = [
  {
    id: 'gq1',
    title: 'Weekly Running Challenge',
    description: 'Collectively run 100km as a guild this week!',
    type: 'summative',
    trackingType: 'numeric',
    targetValue: 100,
    currentValue: 67,
    unit: 'km',
    status: 'active',
    votes: 0,
    totalMembers: 5,
    startDate: '2025-04-07',
    endDate: '2025-04-14',
    rewardGems: 50,
    rewardItemName: 'Swift Runner Badge',
    createdBy: 'ShadowBlade',
    createdAt: '2025-04-06',
  },
  {
    id: 'gq2',
    title: 'Meditation Streak',
    description: 'All members must meditate for 7 days in a row.',
    type: 'streak',
    trackingType: 'numeric',
    targetValue: 7,
    currentValue: 3,
    unit: 'days',
    status: 'active',
    votes: 0,
    totalMembers: 5,
    startDate: '2025-04-10',
    endDate: '2025-04-17',
    rewardGems: 75,
    rewardItemName: 'Zen Master Badge',
    createdBy: 'MageLena',
    createdAt: '2025-04-09',
  },
];

const mockCompletedQuests: GuildQuest[] = [
  {
    id: 'gq3',
    title: 'New Year Resolution',
    description: 'Log 500 workouts as a guild in January.',
    type: 'summative',
    trackingType: 'numeric',
    targetValue: 500,
    currentValue: 500,
    unit: 'workouts',
    status: 'completed',
    votes: 0,
    totalMembers: 5,
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    rewardGems: 200,
    rewardItemName: 'Phoenix Badge',
    createdBy: 'ShadowBlade',
    createdAt: '2024-12-28',
  },
];

const mockBadges: GuildBadge[] = [
  {
    id: 'b1',
    name: 'Founders',
    description: 'Original members of the guild',
    icon: '🏆',
    earnedAt: '2025-01-15',
  },
  {
    id: 'b2',
    name: 'Marathoners',
    description: 'Completed first guild quest',
    icon: '🏃',
    earnedAt: '2025-02-01',
  },
  {
    id: 'b3',
    name: 'Team Players',
    description: '100% participation in 3 quests',
    icon: '🤝',
    earnedAt: '2025-03-15',
  },
];

const availableIcons = ['🐉', '⚔️', '🛡️', '🏹', '🔮', '💀', '🦁', '🐺', '🦅', '🐍', '🌙', '⭐', '🔥', '💧', '🌿'];

export default function GuildsPage() {
  const [guild, setGuild] = useState<Guild | null>(mockMyGuild);
  const [activeQuests, setActiveQuests] = useState<GuildQuest[]>(mockGuildQuests);
  const [completedQuests, setCompletedQuests] = useState<GuildQuest[]>(mockCompletedQuests);
  const [badges, setBadges] = useState<GuildBadge[]>(mockBadges);
  const [selectedQuest, setSelectedQuest] = useState<GuildQuest | null>(null);
  const [showCreateQuestModal, setShowCreateQuestModal] = useState(false);
  const [showCreateGuildModal, setShowCreateGuildModal] = useState(false);
  const [logValue, setLogValue] = useState('');
  const [logNote, setLogNote] = useState('');

  // New guild form state
  const [newGuild, setNewGuild] = useState({
    name: '',
    description: '',
    avatar: '🐉',
  });

  // New quest form state
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    type: 'summative' as 'summative' | 'concurrent' | 'streak',
    trackingType: 'binary' as 'binary' | 'numeric' | 'timer',
    targetValue: 1,
    unit: 'times',
    rewardGems: 50,
  });

  const userIsLeader = true; // In real app, check if current user's role === 'leader'
  const currentUserId = 'u1';

  const getMemberRole = (userId: string): 'leader' | 'member' | null => {
    const member = guild?.members.find(m => m.userId === userId);
    return member?.role || null;
  };

  const isLeader = getMemberRole(currentUserId) === 'leader';

  const handleLogProgress = (quest: GuildQuest) => {
    setSelectedQuest(quest);
    setLogValue('');
    setLogNote('');
  };

  const submitProgress = () => {
    if (!selectedQuest) return;
    const value = parseFloat(logValue);
    if (isNaN(value)) return;

    setActiveQuests(prev => prev.map(q => {
      if (q.id === selectedQuest.id) {
        const newCurrent = Math.min(q.currentValue + value, q.targetValue);
        return { ...q, currentValue: newCurrent };
      }
      return q;
    }));
    setSelectedQuest(null);
  };

  const handleCreateGuild = () => {
    const newGuildObj: Guild = {
      id: Date.now().toString(),
      name: newGuild.name,
      description: newGuild.description,
      avatar: newGuild.avatar,
      level: 1,
      xp: 0,
      xpNext: 1000,
      gems: 0,
      members: [
        {
          id: 'new-m1',
          userId: currentUserId,
          username: 'You',
          avatar: '🧙',
          role: 'leader',
          joinedAt: new Date().toISOString(),
          contribution: 0,
          streak: 0,
        },
      ],
      createdAt: new Date().toISOString(),
    };
    setGuild(newGuildObj);
    setShowCreateGuildModal(false);
    setNewGuild({ name: '', description: '', avatar: '🐉' });
  };

  const handleCreateQuest = () => {
    const quest: GuildQuest = {
      id: Date.now().toString(),
      title: newQuest.title,
      description: newQuest.description,
      type: newQuest.type,
      trackingType: newQuest.trackingType,
      targetValue: newQuest.targetValue,
      currentValue: 0,
      unit: newQuest.unit,
      status: 'drafting',
      votes: 0,
      totalMembers: guild?.members.length || 0,
      startDate: null,
      endDate: null,
      rewardGems: newQuest.rewardGems,
      rewardItemName: 'Custom Badge',
      createdBy: 'You',
      createdAt: new Date().toISOString(),
    };
    setActiveQuests(prev => [quest, ...prev]);
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
  };

  const handleVote = (questId: string, vote: 'yes' | 'no') => {
    setActiveQuests(prev => prev.map(q => {
      if (q.id === questId) {
        return { ...q, votes: q.votes + 1 };
      }
      return q;
    }));
  };

  const getProgressPercentage = (quest: GuildQuest): number => {
    return (quest.currentValue / quest.targetValue) * 100;
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'summative': return '📊';
      case 'concurrent': return '👥';
      case 'streak': return '🔥';
      default: return '⚔️';
    }
  };

  const getStatusBadge = (status: string): { text: string; color: string; icon: string } => {
    switch (status) {
      case 'drafting': return { text: 'VOTING', color: 'var(--pixel-gold)', icon: '🗳️' };
      case 'active': return { text: 'ACTIVE', color: 'var(--pixel-success)', icon: '⚔️' };
      case 'completed': return { text: 'COMPLETED', color: 'var(--pixel-secondary)', icon: '🏆' };
      case 'failed': return { text: 'FAILED', color: 'var(--pixel-primary)', icon: '💀' };
      default: return { text: 'ACTIVE', color: 'var(--pixel-success)', icon: '⚔️' };
    }
  };

  const getXpPercentage = () => {
    if (!guild) return 0;
    return (guild.xp / guild.xpNext) * 100;
  };

  if (!guild) {
    return (
      <div className="guilds">
        <div className="guilds__empty pixel-card">
          <div className="guilds__empty-icon">⚔️</div>
          <h2>No Guild Yet</h2>
          <p>Create or join a guild to start your cooperative adventure!</p>
          <button className="pixel-btn" onClick={() => setShowCreateGuildModal(true)}>
            Create Guild
          </button>
        </div>

        {/* Create Guild Modal */}
        {showCreateGuildModal && (
          <div className="modal-overlay" onClick={() => setShowCreateGuildModal(false)}>
            <div className="modal pixel-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal__header">
                <h3>⚔️ Create New Guild</h3>
                <button className="modal__close" onClick={() => setShowCreateGuildModal(false)}>✖</button>
              </div>
              <div className="modal__body">
                <div className="modal__field">
                  <label>Guild Name:</label>
                  <input
                    type="text"
                    value={newGuild.name}
                    onChange={(e) => setNewGuild({...newGuild, name: e.target.value})}
                    placeholder="e.g., Dragon Slayers"
                    className="pixel-input"
                  />
                </div>
                <div className="modal__field">
                  <label>Description:</label>
                  <textarea
                    value={newGuild.description}
                    onChange={(e) => setNewGuild({...newGuild, description: e.target.value})}
                    placeholder="What is your guild about?"
                    className="pixel-input pixel-input--textarea"
                    rows={2}
                  />
                </div>
                <div className="modal__field">
                  <label>Guild Icon:</label>
                  <div className="modal__icon-grid">
                    {availableIcons.map(icon => (
                      <button
                        key={icon}
                        className={`modal__icon-btn ${newGuild.avatar === icon ? 'active' : ''}`}
                        onClick={() => setNewGuild({...newGuild, avatar: icon})}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal__footer">
                <button className="pixel-btn" onClick={handleCreateGuild} disabled={!newGuild.name}>
                  Create Guild
                </button>
                <button className="pixel-btn pixel-btn--secondary" onClick={() => setShowCreateGuildModal(false)}>
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

      {/* Guild Header */}
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
        {isLeader && (
          <button className="pixel-btn" onClick={() => setShowCreateQuestModal(true)}>
            + Create Quest
          </button>
        )}
      </div>

      {/* Guild Hall - Two Columns */}
      <div className="guilds__hall">
        {/* Left Column - Members & Badges */}
        <div className="guilds__left">
          {/* Members Section */}
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
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Badges Section */}
          <section className="guilds__section">
            <h2 className="pixel-heading">🏅 GUILD BADGES 🏅</h2>
            <div className="guilds__badges">
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

        {/* Right Column - Active Quests */}
        <div className="guilds__right">
          <section className="guilds__section">
            <h2 className="pixel-heading">⚔️ ACTIVE QUESTS ⚔️</h2>
            <div className="guilds__quests">
              {activeQuests.length === 0 && (
                <div className="guilds__empty-quests pixel-card">
                  <span>No active quests. Create one to start your adventure!</span>
                </div>
              )}
              {activeQuests.map((quest) => {
                const status = getStatusBadge(quest.status);
                const progress = getProgressPercentage(quest);
                return (
                  <div key={quest.id} className="quest-card pixel-card">
                    <div className="quest-card__icon">{getTypeIcon(quest.type)}</div>
                    <div className="quest-card__content">
                      <div className="quest-card__header">
                        <h3>{quest.title}</h3>
                        <span className="quest-card__status" style={{ color: status.color }}>
                          {status.icon} {status.text}
                        </span>
                      </div>
                      <p className="quest-card__description">{quest.description}</p>
                      
                      {quest.status === 'drafting' && (
                        <div className="quest-card__voting">
                          <span>🗳️ Voting in progress: {quest.votes}/{quest.totalMembers} voted</span>
                          {isLeader && (
                            <div className="quest-card__vote-buttons">
                              <button className="pixel-btn pixel-btn--small" onClick={() => handleVote(quest.id, 'yes')}>
                                ✅ Approve
                              </button>
                              <button className="pixel-btn pixel-btn--small pixel-btn--secondary" onClick={() => handleVote(quest.id, 'no')}>
                                ❌ Reject
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {quest.status === 'active' && (
                        <>
                          <div className="quest-card__progress">
                            <div className="quest-card__progress-bar">
                              <div className="quest-card__progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="quest-card__progress-stats">
                              <span>{quest.currentValue} / {quest.targetValue} {quest.unit}</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                          </div>
                          <div className="quest-card__details">
                            <span>⏰ Ends {quest.endDate ? new Date(quest.endDate).toLocaleDateString() : 'TBD'}</span>
                            <span>💎 {quest.rewardGems} gems + {quest.rewardItemName}</span>
                          </div>
                          <button 
                            className="pixel-btn pixel-btn--small"
                            onClick={() => handleLogProgress(quest)}
                          >
                            Log Progress
                          </button>
                        </>
                      )}
                      
                      {quest.status === 'completed' && (
                        <div className="quest-card__reward">
                          <span>🏆 Completed! Rewards: {quest.rewardGems} gems + {quest.rewardItemName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Completed Quests */}
          {completedQuests.length > 0 && (
            <section className="guilds__section">
              <h2 className="pixel-heading">📜 COMPLETED QUESTS 📜</h2>
              <div className="guilds__quests">
                {completedQuests.map((quest) => (
                  <div key={quest.id} className="quest-card quest-card--completed pixel-card">
                    <div className="quest-card__icon">🏆</div>
                    <div className="quest-card__content">
                      <div className="quest-card__header">
                        <h3>{quest.title}</h3>
                        <span className="quest-card__status" style={{ color: 'var(--pixel-secondary)' }}>
                          COMPLETED
                        </span>
                      </div>
                      <p className="quest-card__description">{quest.description}</p>
                      <div className="quest-card__reward">
                        <span>🎉 Earned: {quest.rewardGems} gems + {quest.rewardItemName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Log Progress Modal */}
      {selectedQuest && (
        <div className="modal-overlay" onClick={() => setSelectedQuest(null)}>
          <div className="modal pixel-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Log Guild Progress</h3>
              <button className="modal__close" onClick={() => setSelectedQuest(null)}>✖</button>
            </div>
            <div className="modal__body">
              <p><strong>{selectedQuest.title}</strong></p>
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
              <button className="pixel-btn" onClick={submitProgress}>Submit Progress</button>
              <button className="pixel-btn pixel-btn--secondary" onClick={() => setSelectedQuest(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Quest Modal */}
      {showCreateQuestModal && (
        <div className="modal-overlay" onClick={() => setShowCreateQuestModal(false)}>
          <div className="modal modal--large pixel-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>⚔️ Create Guild Quest</h3>
              <button className="modal__close" onClick={() => setShowCreateQuestModal(false)}>✖</button>
            </div>
            <div className="modal__body">
              <div className="modal__field">
                <label>Quest Title:</label>
                <input 
                  type="text" 
                  value={newQuest.title} 
                  onChange={(e) => setNewQuest({...newQuest, title: e.target.value})}
                  placeholder="e.g., Weekly Running Challenge"
                  className="pixel-input"
                />
              </div>
              <div className="modal__field">
                <label>Description:</label>
                <textarea 
                  value={newQuest.description} 
                  onChange={(e) => setNewQuest({...newQuest, description: e.target.value})}
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
                    onChange={(e) => setNewQuest({...newQuest, type: e.target.value as any})}
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
                    onChange={(e) => setNewQuest({...newQuest, trackingType: e.target.value as any})}
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
                    onChange={(e) => setNewQuest({...newQuest, targetValue: parseFloat(e.target.value) || 0})}
                    className="pixel-input"
                  />
                </div>
                <div className="modal__field">
                  <label>Unit:</label>
                  <input 
                    type="text" 
                    value={newQuest.unit} 
                    onChange={(e) => setNewQuest({...newQuest, unit: e.target.value})}
                    placeholder="km, days, workouts"
                    className="pixel-input"
                  />
                </div>
                <div className="modal__field">
                  <label>Reward Gems:</label>
                  <input 
                    type="number" 
                    value={newQuest.rewardGems} 
                    onChange={(e) => setNewQuest({...newQuest, rewardGems: parseInt(e.target.value) || 0})}
                    className="pixel-input"
                  />
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button className="pixel-btn" onClick={handleCreateQuest} disabled={!newQuest.title}>
                Create Quest
              </button>
              <button className="pixel-btn pixel-btn--secondary" onClick={() => setShowCreateQuestModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}