// app/tavern/page.tsx
"use client";

import React, { useState } from 'react';
import './tavern.scss';

// Types
interface GlobalEvent {
  id: string;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  endDate: string;
  participants: number;
  rewardCoins: number;
  rewardItemName: string;
  icon: string;
  status: 'active' | 'ending-soon' | 'completed';
}

interface PublicQuest {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  category: 'fitness' | 'education' | 'creativity' | 'wellness' | 'other';
  difficulty: 'easy' | 'medium' | 'hard';
  trackingType: 'binary' | 'numeric' | 'timer';
  targetValue: number;
  unit: string;
  participants: number;
  rating: number;
  createdAt: string;
  icon: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  reported: boolean;
}

// Mock data
const mockEvents: GlobalEvent[] = [
  {
    id: '1',
    title: '🔥 Dragon Hunt',
    description: 'The Crimson Dragon terrorizes the realm! Run collectively 10,000 km to defeat it.',
    currentValue: 6780,
    targetValue: 10000,
    unit: 'km',
    endDate: '2025-04-20',
    participants: 1247,
    rewardCoins: 500,
    rewardItemName: 'Dragon Slayer Badge',
    icon: '🐉',
    status: 'active',
  },
  {
    id: '2',
    title: '📚 Library Crusade',
    description: 'Read 50,000 pages together and unlock ancient knowledge.',
    currentValue: 31200,
    targetValue: 50000,
    unit: 'pages',
    endDate: '2025-04-25',
    participants: 892,
    rewardCoins: 300,
    rewardItemName: 'Sage\'s Scroll Badge',
    icon: '📖',
    status: 'active',
  },
  {
    id: '3',
    title: '🧘 Mindful March',
    description: 'Meditate 1 million minutes as a community.',
    currentValue: 845000,
    targetValue: 1000000,
    unit: 'min',
    endDate: '2025-03-31',
    participants: 2156,
    rewardCoins: 400,
    rewardItemName: 'Zen Master Badge',
    icon: '🕉️',
    status: 'ending-soon',
  },
];

const mockPublicQuests: PublicQuest[] = [
  {
    id: '1',
    title: '30-Day Drawing Challenge',
    description: 'Create one sketch every day for 30 days. Share your progress in the comments!',
    author: 'Artemis',
    authorAvatar: '🎨',
    category: 'creativity',
    difficulty: 'medium',
    trackingType: 'numeric',
    targetValue: 30,
    unit: 'days',
    participants: 342,
    rating: 4.8,
    createdAt: '2025-03-01',
    icon: '✏️',
  },
  {
    id: '2',
    title: 'Couch to 5K',
    description: 'Complete the Couch to 5K running program. Log each workout.',
    author: 'RunnerJoe',
    authorAvatar: '🏃',
    category: 'fitness',
    difficulty: 'medium',
    trackingType: 'binary',
    targetValue: 1,
    unit: 'program',
    participants: 567,
    rating: 4.9,
    createdAt: '2025-02-15',
    icon: '🏃',
  },
  {
    id: '3',
    title: 'Learn Python Basics',
    description: 'Complete 20 coding exercises. Post proof of your solutions.',
    author: 'CodeWizard',
    authorAvatar: '💻',
    category: 'education',
    difficulty: 'hard',
    trackingType: 'numeric',
    targetValue: 20,
    unit: 'exercises',
    participants: 189,
    rating: 4.7,
    createdAt: '2025-03-10',
    icon: '🐍',
  },
  {
    id: '4',
    title: 'Daily Gratitude Journal',
    description: 'Write 3 things you\'re grateful for each day.',
    author: 'MindfulSoul',
    authorAvatar: '💚',
    category: 'wellness',
    difficulty: 'easy',
    trackingType: 'binary',
    targetValue: 1,
    unit: 'entry',
    participants: 892,
    rating: 4.9,
    createdAt: '2025-02-01',
    icon: '📔',
  },
];

const mockComments: Comment[] = [
  {
    id: '1',
    userId: '1',
    userName: 'ShadowBlade',
    userAvatar: '🗡️',
    content: 'This event is awesome! Already ran 45km this week!',
    createdAt: '2025-04-12T10:30:00',
    reported: false,
  },
  {
    id: '2',
    userId: '2',
    userName: 'MageLena',
    userAvatar: '✨',
    content: 'The Dragon Hunt is so motivating. Let\'s go everyone! 🔥',
    createdAt: '2025-04-12T09:15:00',
    reported: false,
  },
  {
    id: '3',
    userId: '3',
    userName: 'HealerAmy',
    userAvatar: '💚',
    content: 'Just joined the Library Crusade. Already read 200 pages this week!',
    createdAt: '2025-04-11T18:45:00',
    reported: false,
  },
];

// Available categories for filtering
const categories = ['all', 'fitness', 'education', 'creativity', 'wellness'];

export default function TavernPage() {
  const [events, setEvents] = useState<GlobalEvent[]>(mockEvents);
  const [publicQuests, setPublicQuests] = useState<PublicQuest[]>(mockPublicQuests);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [selectedEvent, setSelectedEvent] = useState<GlobalEvent | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<PublicQuest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'difficulty'>('popular');

  // New public quest form state
  const [newPublicQuest, setNewPublicQuest] = useState({
    title: '',
    description: '',
    category: 'fitness' as PublicQuest['category'],
    difficulty: 'medium' as PublicQuest['difficulty'],
    trackingType: 'binary' as 'binary' | 'numeric' | 'timer',
    targetValue: 1,
    unit: 'times',
    icon: '⚔️',
  });

  const availableIcons = ['🏃', '📚', '🧘', '💪', '🗣️', '🎨', '🎸', '🍳', '💧', '🌟', '🐉', '📖', '✏️', '💻', '📔'];

  const handleJoinEvent = (event: GlobalEvent) => {
    setSelectedEvent(event);
  };

  const handleJoinQuest = (quest: PublicQuest) => {
    setSelectedQuest(quest);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'You',
      userAvatar: '🧙',
      content: newComment,
      createdAt: new Date().toISOString(),
      reported: false,
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleCreatePublicQuest = () => {
    const quest: PublicQuest = {
      id: Date.now().toString(),
      title: newPublicQuest.title,
      description: newPublicQuest.description,
      author: 'You',
      authorAvatar: '🧙',
      category: newPublicQuest.category,
      difficulty: newPublicQuest.difficulty,
      trackingType: newPublicQuest.trackingType,
      targetValue: newPublicQuest.targetValue,
      unit: newPublicQuest.unit,
      participants: 1,
      rating: 0,
      createdAt: new Date().toISOString(),
      icon: newPublicQuest.icon,
    };
    
    setPublicQuests(prev => [quest, ...prev]);
    setShowCreateModal(false);
    setNewPublicQuest({
      title: '',
      description: '',
      category: 'fitness',
      difficulty: 'medium',
      trackingType: 'binary',
      targetValue: 1,
      unit: 'times',
      icon: '⚔️',
    });
  };

  const getFilteredQuests = () => {
    let filtered = publicQuests;
    if (filterCategory !== 'all') {
      filtered = filtered.filter(q => q.category === filterCategory);
    }
    
    switch (sortBy) {
      case 'popular':
        return [...filtered].sort((a, b) => b.participants - a.participants);
      case 'newest':
        return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return [...filtered].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
      default:
        return filtered;
    }
  };

  const getTimeRemaining = (endDate: string): string => {
    const days = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    if (days <= 0) return 'Ended';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'var(--pixel-success)';
      case 'medium': return 'var(--pixel-gold)';
      case 'hard': return 'var(--pixel-primary)';
      default: return 'var(--pixel-text-dim)';
    }
  };

  const getStatusBadge = (status: string): { text: string; color: string } => {
    switch (status) {
      case 'active': return { text: 'ACTIVE', color: 'var(--pixel-success)' };
      case 'ending-soon': return { text: 'ENDING SOON', color: 'var(--pixel-primary)' };
      case 'completed': return { text: 'COMPLETED', color: 'var(--pixel-text-dim)' };
      default: return { text: 'ACTIVE', color: 'var(--pixel-success)' };
    }
  };

  return (
    <div className="tavern">
      {/* Pixel particles background */}
      <div className="tavern__particles"></div>

      {/* Hero Banner */}
      <div className="tavern__hero pixel-card">
        <div className="tavern__hero-content">
          <h1 className="pixel-title">🍺 THE TAVERN 🍺</h1>
          <p className="tavern__hero-text">
            Gather here for public events, community challenges, and legendary rewards.  
            Join forces with adventurers worldwide!
          </p>
        </div>
        <div className="tavern__hero-stats">
          <div className="tavern__stat">
            <span className="tavern__stat-value">{events.length}</span>
            <span className="tavern__stat-label">Active Events</span>
          </div>
          <div className="tavern__stat">
            <span className="tavern__stat-value">{publicQuests.length}</span>
            <span className="tavern__stat-label">Public Quests</span>
          </div>
          <div className="tavern__stat">
            <span className="tavern__stat-value">{comments.length}</span>
            <span className="tavern__stat-label">Tavern Talks</span>
          </div>
        </div>
      </div>

      {/* Global Events Section */}
      <section className="tavern__section">
        <div className="tavern__section-header">
          <h2 className="pixel-heading">🌍 GLOBAL EVENTS 🌍</h2>
          <span className="tavern__section-sub">Official challenges with epic rewards</span>
        </div>
        <div className="tavern__events-grid">
          {events.map((event) => {
            const status = getStatusBadge(event.status);
            const progress = (event.currentValue / event.targetValue) * 100;
            return (
              <div key={event.id} className="event-card pixel-card">
                <div className="event-card__header">
                  <div className="event-card__icon">{event.icon}</div>
                  <div className="event-card__info">
                    <h3>{event.title}</h3>
                    <span className="event-card__status" style={{ color: status.color }}>{status.text}</span>
                  </div>
                </div>
                <p className="event-card__description">{event.description}</p>
                <div className="event-card__progress">
                  <div className="event-card__progress-bar">
                    <div className="event-card__progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="event-card__progress-stats">
                    <span>{event.currentValue.toLocaleString()} / {event.targetValue.toLocaleString()} {event.unit}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
                <div className="event-card__details">
                  <div className="event-card__detail">
                    <span>⏰ {getTimeRemaining(event.endDate)}</span>
                    <span>👥 {event.participants.toLocaleString()} adventurers</span>
                  </div>
                  <div className="event-card__detail">
                    <span>💰 {event.rewardCoins} coins</span>
                    <span>🏅 {event.rewardItemName}</span>
                  </div>
                </div>
                <button 
                  className="pixel-btn pixel-btn--small"
                  onClick={() => handleJoinEvent(event)}
                  disabled={event.status === 'completed'}
                >
                  {event.status === 'completed' ? 'COMPLETED' : '⚔️ JOIN EVENT'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Public Quests Section */}
      <section className="tavern__section">
        <div className="tavern__section-header">
          <h2 className="pixel-heading">📜 PUBLIC QUESTS 📜</h2>
          <button className="pixel-btn pixel-btn--small" onClick={() => setShowCreateModal(true)}>
            + Create Quest
          </button>
        </div>
        
        {/* Filters */}
        <div className="tavern__filters">
          <div className="tavern__filter-group">
            <span className="tavern__filter-label">Category:</span>
            <div className="tavern__filter-buttons">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`tavern__filter-btn ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>
          <div className="tavern__filter-group">
            <span className="tavern__filter-label">Sort by:</span>
            <div className="tavern__filter-buttons">
              <button
                className={`tavern__filter-btn ${sortBy === 'popular' ? 'active' : ''}`}
                onClick={() => setSortBy('popular')}
              >
                Popular
              </button>
              <button
                className={`tavern__filter-btn ${sortBy === 'newest' ? 'active' : ''}`}
                onClick={() => setSortBy('newest')}
              >
                Newest
              </button>
              <button
                className={`tavern__filter-btn ${sortBy === 'difficulty' ? 'active' : ''}`}
                onClick={() => setSortBy('difficulty')}
              >
                Difficulty
              </button>
            </div>
          </div>
        </div>

        <div className="tavern__quests-grid">
          {getFilteredQuests().map((quest) => (
            <div key={quest.id} className="quest-card pixel-card">
              <div className="quest-card__icon">{quest.icon}</div>
              <div className="quest-card__content">
                <div className="quest-card__header">
                  <h3>{quest.title}</h3>
                  <span className="quest-card__difficulty" style={{ color: getDifficultyColor(quest.difficulty) }}>
                    {quest.difficulty.toUpperCase()}
                  </span>
                </div>
                <p className="quest-card__description">{quest.description}</p>
                <div className="quest-card__meta">
                  <span className="quest-card__author">by {quest.author}</span>
                  <span className="quest-card__category">#{quest.category}</span>
                </div>
                <div className="quest-card__stats">
                  <span>👥 {quest.participants} joined</span>
                  <span>⭐ {quest.rating > 0 ? quest.rating.toFixed(1) : 'New'}</span>
                  <span>🎯 {quest.targetValue} {quest.unit}</span>
                </div>
                <button 
                  className="pixel-btn pixel-btn--small"
                  onClick={() => handleJoinQuest(quest)}
                >
                  Join Quest
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tavern Talks - Comments Section */}
      <section className="tavern__section">
        <div className="tavern__section-header">
          <h2 className="pixel-heading">💬 TAVERN TALKS 💬</h2>
          <span className="tavern__section-sub">Share your adventures with the community</span>
        </div>
        
        <div className="tavern__comments">
          <div className="tavern__comment-input pixel-card">
            <div className="tavern__comment-avatar">🧙</div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your progress, tips, or encouragement..."
              className="tavern__comment-textarea pixel-input"
              rows={2}
            />
            <button className="pixel-btn" onClick={handleAddComment}>
              Post
            </button>
          </div>
          
          <div className="tavern__comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-card pixel-card">
                <div className="comment-card__avatar">{comment.userAvatar}</div>
                <div className="comment-card__content">
                  <div className="comment-card__header">
                    <span className="comment-card__name">{comment.userName}</span>
                    <span className="comment-card__date">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="comment-card__text">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Event Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal pixel-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Join {selectedEvent.title}</h3>
              <button className="modal__close" onClick={() => setSelectedEvent(null)}>✖</button>
            </div>
            <div className="modal__body">
              <p>You are about to join this global event!</p>
              <p>Your progress will count toward the community goal.</p>
              <div className="modal__reward">
                <span>🏆 Rewards:</span>
                <span>{selectedEvent.rewardCoins} coins + {selectedEvent.rewardItemName}</span>
              </div>
            </div>
            <div className="modal__footer">
              <button className="pixel-btn" onClick={() => setSelectedEvent(null)}>
                Join Event
              </button>
              <button className="pixel-btn pixel-btn--secondary" onClick={() => setSelectedEvent(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Quest Modal */}
      {selectedQuest && (
        <div className="modal-overlay" onClick={() => setSelectedQuest(null)}>
          <div className="modal pixel-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Join {selectedQuest.title}</h3>
              <button className="modal__close" onClick={() => setSelectedQuest(null)}>✖</button>
            </div>
            <div className="modal__body">
              <p>You are about to join this public quest created by {selectedQuest.author}.</p>
              <p>Track your progress and earn reputation!</p>
            </div>
            <div className="modal__footer">
              <button className="pixel-btn" onClick={() => setSelectedQuest(null)}>
                Join Quest
              </button>
              <button className="pixel-btn pixel-btn--secondary" onClick={() => setSelectedQuest(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Public Quest Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal pixel-card modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>📜 Create Public Quest</h3>
              <button className="modal__close" onClick={() => setShowCreateModal(false)}>✖</button>
            </div>
            <div className="modal__body">
              <div className="modal__field">
                <label>Quest Title:</label>
                <input 
                  type="text" 
                  value={newPublicQuest.title} 
                  onChange={(e) => setNewPublicQuest({...newPublicQuest, title: e.target.value})}
                  placeholder="e.g., 30-Day Drawing Challenge"
                  className="pixel-input"
                />
              </div>
              <div className="modal__field">
                <label>Description:</label>
                <textarea 
                  value={newPublicQuest.description} 
                  onChange={(e) => setNewPublicQuest({...newPublicQuest, description: e.target.value})}
                  placeholder="Describe your challenge..."
                  className="pixel-input pixel-input--textarea"
                  rows={2}
                />
              </div>
              <div className="modal__field">
                <label>Icon:</label>
                <div className="modal__icon-grid">
                  {availableIcons.map(icon => (
                    <button
                      key={icon}
                      className={`modal__icon-btn ${newPublicQuest.icon === icon ? 'active' : ''}`}
                      onClick={() => setNewPublicQuest({...newPublicQuest, icon})}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal__row">
                <div className="modal__field">
                  <label>Category:</label>
                  <select 
                    value={newPublicQuest.category} 
                    onChange={(e) => setNewPublicQuest({...newPublicQuest, category: e.target.value as any})}
                    className="pixel-input"
                  >
                    <option value="fitness">Fitness</option>
                    <option value="education">Education</option>
                    <option value="creativity">Creativity</option>
                    <option value="wellness">Wellness</option>
                  </select>
                </div>
                <div className="modal__field">
                  <label>Difficulty:</label>
                  <select 
                    value={newPublicQuest.difficulty} 
                    onChange={(e) => setNewPublicQuest({...newPublicQuest, difficulty: e.target.value as any})}
                    className="pixel-input"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="modal__row">
                <div className="modal__field">
                  <label>Tracking Type:</label>
                  <select 
                    value={newPublicQuest.trackingType} 
                    onChange={(e) => setNewPublicQuest({...newPublicQuest, trackingType: e.target.value as any})}
                    className="pixel-input"
                  >
                    <option value="binary">Yes/No</option>
                    <option value="numeric">Numeric</option>
                    <option value="timer">Timer</option>
                  </select>
                </div>
                <div className="modal__field">
                  <label>Target Value:</label>
                  <input 
                    type="number" 
                    value={newPublicQuest.targetValue} 
                    onChange={(e) => setNewPublicQuest({...newPublicQuest, targetValue: parseFloat(e.target.value) || 0})}
                    className="pixel-input"
                  />
                </div>
                <div className="modal__field">
                  <label>Unit:</label>
                  <input 
                    type="text" 
                    value={newPublicQuest.unit} 
                    onChange={(e) => setNewPublicQuest({...newPublicQuest, unit: e.target.value})}
                    placeholder="km, days, exercises"
                    className="pixel-input"
                  />
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button className="pixel-btn" onClick={handleCreatePublicQuest} disabled={!newPublicQuest.title}>
                Publish Quest
              </button>
              <button className="pixel-btn pixel-btn--secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}