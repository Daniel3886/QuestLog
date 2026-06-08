'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ApiError,
  commentsApi,
  eventsApi,
  questsApi,
  reportsApi,
  usersApi,
} from '@/lib/api';
import {
  categoryMap,
  difficultyMap,
  trackingMap,
} from '@/lib/enums';
import { isLoggedIn } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import type { GlobalEvent, PublicQuest, TavernComment } from '@/lib/types';
import ErrorBanner from '@/components/ErrorBanner';
import './tavern.scss';

const categories = ['all', 'fitness', 'education', 'creativity', 'wellness'];
const availableIcons = [
  '🏃', '📚', '🧘', '💪', '🗣️', '🎨', '🎸', '🍳', '💧', '🌟', '🐉', '📖', '✏️', '💻', '📔',
];

export default function TavernPage() {
  const router = useRouter();
  const [events, setEvents] = useState<GlobalEvent[]>([]);
  const [publicQuests, setPublicQuests] = useState<PublicQuest[]>([]);
  const [comments, setComments] = useState<TavernComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userAvatar, setUserAvatar] = useState('🧙');

  const [selectedEvent, setSelectedEvent] = useState<GlobalEvent | null>(null);
  const [eventContribute, setEventContribute] = useState('1');
  const [eventComments, setEventComments] = useState<TavernComment[]>([]);
  const [eventCommentText, setEventCommentText] = useState('');

  const [selectedQuest, setSelectedQuest] = useState<PublicQuest | null>(null);
  const [publicProgress, setPublicProgress] = useState('');
  const [publicNote, setPublicNote] = useState('');
  const [publicProofImage, setPublicProofImage] = useState<File | null>(null);
  const [publicProofPreview, setPublicProofPreview] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'difficulty'>(
    'popular',
  );

  const [newPublicQuest, setNewPublicQuest] = useState({
  title: '',
  description: '',
  category: 'fitness' as 'fitness' | 'education' | 'creativity' | 'wellness' | 'other',
  difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  trackingType: 'binary' as 'binary' | 'numeric',
  proofRequired: 'none' as 'none' | 'text' | 'image',
  targetValue: 1,
  unit: 'times',
  icon: '⚔️',
});

  const loadTavern = useCallback(async () => {
    setError('');
    try {
      const categoryParam =
        filterCategory !== 'all'
          ? categoryMap[filterCategory as keyof typeof categoryMap]
          : undefined;

      const [eventList, questList, commentList] = await Promise.all([
        eventsApi.list(),
        questsApi.listPublic({
          category: categoryParam,
          sort: sortBy,
        }),
        commentsApi.list('TAVERN', 'global'),
      ]);
      setEvents(eventList);
      setPublicQuests(questList);
      setComments(commentList);

    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load tavern');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, sortBy]);

  useEffect(() => {
    loadTavern();
  }, [loadTavern]);

  useEffect(() => {
    if (!selectedEvent) {
      setEventComments([]);
      return;
    }

    (async () => {
      try {
        const comments = await commentsApi.list('EVENT', selectedEvent.id);
        setEventComments(comments);
      } catch (err) {
        // ignore errors here; event detail still loads
      }
    })();
  }, [selectedEvent]);

  const requireAuth = () => {
    if (!isLoggedIn()) {
      router.push('/login');
      return false;
    }
    return true;
  };

  const confirmJoinEvent = async () => {
    if (!selectedEvent || !requireAuth()) return;
    setSubmitting(true);
    setError('');
    try {
      await eventsApi.join(selectedEvent.id);
      const amount = parseFloat(eventContribute);
      if (!Number.isNaN(amount) && amount > 0) {
        const result = await eventsApi.contribute(selectedEvent.id, amount);
        if (result.rewardsGranted) {
          setError('Event complete! Rewards added to your account.');
        }
      }
      setSelectedEvent(null);
      await loadTavern();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to join event');
    } finally {
      setSubmitting(false);
    }
  };

  const resetJoinModal = () => {
    setSelectedQuest(null);
    setPublicProgress('');
    setPublicNote('');
    setPublicProofImage(null);
    setPublicProofPreview(null);
  };

  const confirmJoinQuest = async () => {
    if (!selectedQuest || !requireAuth()) return;
    setSubmitting(true);
    setError('');
    try {
      await questsApi.joinPublic(selectedQuest.id);
      let value = parseFloat(publicProgress);
      if (selectedQuest.trackingType === 'binary') {
        value = selectedQuest.targetValue;
      }
      if (!Number.isNaN(value) && value > 0) {
        let proofUrl: string | undefined;
        if (selectedQuest.proofRequired === 'image' && publicProofImage) {
          const reader = new FileReader();
          proofUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read image'));
            reader.readAsDataURL(publicProofImage);
          });
        }
        await questsApi.updatePublicProgress(
          selectedQuest.id,
          Math.min(value, selectedQuest.targetValue),
          publicNote || undefined,
          proofUrl,   // pass image data URL if any
        );
      }
      resetJoinModal();
      await loadTavern();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to join quest');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !requireAuth()) return;
    setSubmitting(true);
    try {
      const created = await commentsApi.create(
        'TAVERN',
        'global',
        newComment.trim(),
      );
      setComments((prev) => [created, ...prev]);
      setNewComment('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportComment = async (commentId: string) => {
    if (!requireAuth()) return;
    setSubmitting(true);
    setError('');
    try {
      await commentsApi.report(commentId, 'Reported from Tavern');
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setEventComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to report comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportQuest = async (questId: string) => {
    if (!requireAuth()) return;
    setSubmitting(true);
    setError('');
    try {
      await reportsApi.create('QUEST', questId, 'Reported public quest');
      setError('Quest reported. Administrators will review it.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to report quest');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePublicQuest = async () => {
    if (!newPublicQuest.title.trim() || !requireAuth()) return;
    setSubmitting(true);
    try {
      await questsApi.createPublic({
        title: newPublicQuest.title,
        description: newPublicQuest.description || undefined,
        icon: newPublicQuest.icon,
        category: categoryMap[newPublicQuest.category],
        difficulty: difficultyMap[newPublicQuest.difficulty],
        trackingType: trackingMap[newPublicQuest.trackingType],
        proofRequired: newPublicQuest.proofRequired.toUpperCase(),
        targetValue: newPublicQuest.targetValue,
        unit: newPublicQuest.unit,
      });
      setShowCreateModal(false);
      setNewPublicQuest({
        title: '',
        description: '',
        category: 'fitness',
        difficulty: 'medium',
        trackingType: 'binary',
        proofRequired: 'none',
        targetValue: 1,
        unit: 'times',
        icon: '⚔️',
      });
      await loadTavern();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to create public quest',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const days = Math.ceil(
      (new Date(endDate).getTime() - Date.now()) / (1000 * 3600 * 24),
    );
    if (days <= 0) return 'Ended';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'var(--pixel-success)';
      case 'medium':
        return 'var(--pixel-gold)';
      case 'hard':
        return 'var(--pixel-primary)';
      default:
        return 'var(--pixel-text-dim)';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'ACTIVE', color: 'var(--pixel-success)' };
      case 'ending-soon':
        return { text: 'ENDING SOON', color: 'var(--pixel-primary)' };
      case 'completed':
        return { text: 'COMPLETED', color: 'var(--pixel-text-dim)' };
      default:
        return { text: 'ACTIVE', color: 'var(--pixel-success)' };
    }
  };

  if (loading) {
    return <div className="tavern"><p>Loading tavern...</p></div>;
  }

  return (
    <div className="tavern">
      <div className="tavern__particles"></div>
      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <div className="tavern__hero pixel-card">
        <div className="tavern__hero-content">
          <h1 className="pixel-title">🍺 THE TAVERN 🍺</h1>
          <p className="tavern__hero-text">
            Gather here for public events, community challenges, and legendary
            rewards.
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

      <section className="tavern__section">
        <div className="tavern__section-header">
          <h2 className="pixel-heading">🌍 GLOBAL EVENTS 🌍</h2>
        </div>
        <div className="tavern__events-grid">
          {events.map((event) => {
            const status = getStatusBadge(event.status);
            const progress =
              (event.currentValue / event.targetValue) * 100;
            return (
              <div key={event.id} className="event-card pixel-card">
                <div className="event-card__header">
                  <div className="event-card__icon">{event.icon}</div>
                  <div className="event-card__info">
                    <h3>{event.title}</h3>
                    <span
                      className="event-card__status"
                      style={{ color: status.color }}
                    >
                      {status.text}
                    </span>
                  </div>
                </div>
                <p className="event-card__description">{event.description}</p>
                <div className="event-card__progress">
                  <div className="event-card__progress-bar">
                    <div
                      className="event-card__progress-fill"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="event-card__progress-stats">
                    <span>
                      {event.currentValue.toLocaleString()} /{' '}
                      {event.targetValue.toLocaleString()} {event.unit}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
                <div className="event-card__details">
                  <div className="event-card__detail">
                    <span>⏰ {getTimeRemaining(event.endDate)}</span>
                    <span>👥 {event.participants} adventurers</span>
                  </div>
                  <div className="event-card__detail">
                    <span>💰 {event.rewardCoins} coins</span>
                    <span>✨ {event.rewardXp ?? 0} XP</span>
                    {event.rewardItemName && (
                      <span>🏅 {event.rewardItemName}</span>
                    )}
                  </div>
                </div>
                <button
                  className="pixel-btn pixel-btn--small"
                  onClick={() => {
                    setSelectedEvent(event);
                    setEventContribute('1');
                  }}
                  disabled={event.status === 'completed'}
                >
                  {event.status === 'completed' ? 'COMPLETED' : '⚔️ JOIN EVENT'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="tavern__section">
        <div className="tavern__section-header">
          <h2 className="pixel-heading">📜 PUBLIC QUESTS 📜</h2>
          <button
            className="pixel-btn pixel-btn--small"
            onClick={() => requireAuth() && setShowCreateModal(true)}
          >
            + Create Quest
          </button>
        </div>

        <div className="tavern__filters">
          <div className="tavern__filter-group">
            <span className="tavern__filter-label">Category:</span>
            <div className="tavern__filter-buttons">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`tavern__filter-btn ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => {
                    setLoading(true);
                    setFilterCategory(cat);
                  }}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>
          <div className="tavern__filter-group">
            <span className="tavern__filter-label">Sort by:</span>
            <div className="tavern__filter-buttons">
              {(['popular', 'newest', 'difficulty'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`tavern__filter-btn ${sortBy === s ? 'active' : ''}`}
                  onClick={() => {
                    setLoading(true);
                    setSortBy(s);
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="tavern__quests-grid">
          {publicQuests.map((quest) => (
            <div key={quest.id} className="quest-card pixel-card">
              <div className="quest-card__icon">{quest.icon}</div>
              <div className="quest-card__content">
                <div className="quest-card__header">
                  <h3>{quest.title}</h3>
                  <span
                    className="quest-card__difficulty"
                    style={{ color: getDifficultyColor(quest.difficulty) }}
                  >
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
                  <span>
                    ⭐ {quest.rating > 0 ? quest.rating.toFixed(1) : 'New'}
                  </span>
                  <span>
                    🎯 {quest.targetValue} {quest.unit}
                  </span>
                </div>
                <div className="quest-card__meta">
                  <span className="quest-card__tag">
                    {quest.proofRequired === 'text'
                    ? 'Text proof required'
                    : quest.proofRequired === 'image'
                    ? 'Image proof required'
                    : 'No proof'}
                    </span>
                </div>
                <div className="quest-card__actions">
                  <button
                    className="pixel-btn pixel-btn--small"
                    onClick={() => {
                      setSelectedQuest(quest);
                      setPublicProgress('');
                    }}
                  >
                    Join Quest
                  </button>
                  <button
                    className="pixel-btn pixel-btn--secondary pixel-btn--small"
                    onClick={() => handleReportQuest(quest.id)}
                  >
                    Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="tavern__section">
        <div className="tavern__section-header">
          <h2 className="pixel-heading">💬 TAVERN TALKS 💬</h2>
        </div>
        <div className="tavern__comments">
          <div className="tavern__comment-input pixel-card">
            <div className="tavern__comment-avatar">{userAvatar}</div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your progress, tips, or encouragement..."
              className="tavern__comment-textarea pixel-input"
              rows={2}
            />
            <button
              className="pixel-btn"
              onClick={handleAddComment}
              disabled={submitting}
            >
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
                  <button
                    className="pixel-btn pixel-btn--secondary pixel-btn--tiny"
                    onClick={() => handleReportComment(comment.id)}
                  >
                    Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedEvent && (
        <div
          className="modal-overlay"
          onClick={() => !submitting && setSelectedEvent(null)}
        >
          <div className="modal pixel-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Join {selectedEvent.title}</h3>
              <button
                className="modal__close"
                onClick={() => setSelectedEvent(null)}
              >
                ✖
              </button>
            </div>
            <div className="modal__body">
              <p>Join this event and contribute to the community goal.</p>
              <div className="modal__reward">
                <span>
                  Rewards: {selectedEvent.rewardCoins} coins,{' '}
                  {selectedEvent.rewardXp ?? 0} XP
                </span>
              </div>
              <div className="modal__field">
                <label>Contribution ({selectedEvent.unit}):</label>
                <input
                  type="number"
                  value={eventContribute}
                  onChange={(e) => setEventContribute(e.target.value)}
                  className="pixel-input"
                  min={0}
                />
              </div>
              <div className="modal__field">
                <label>Event Comments:</label>
                <div className="modal__comment-box">
                  {eventComments.length === 0 ? (
                    <p>No comments yet. Start the conversation!</p>
                  ) : (
                    eventComments.map((comment) => (
                      <div key={comment.id} className="comment-card comment-card--small pixel-card">
                        <div className="comment-card__header">
                          <span className="comment-card__name">{comment.userName}</span>
                          <span className="comment-card__date">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="comment-card__text">{comment.content}</p>
                        <button
                          className="pixel-btn pixel-btn--secondary pixel-btn--tiny"
                          onClick={() => handleReportComment(comment.id)}
                        >
                          Report
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="modal__field">
                <label>Add a comment:</label>
                <textarea
                  value={eventCommentText}
                  onChange={(e) => setEventCommentText(e.target.value)}
                  className="pixel-input pixel-input--textarea"
                  rows={2}
                />
                <button
                  className="pixel-btn pixel-btn--small"
                  onClick={async () => {
                    if (!eventCommentText.trim() || !requireAuth()) return;
                    setSubmitting(true);
                    try {
                      const created = await commentsApi.create(
                        'EVENT',
                        selectedEvent.id,
                        eventCommentText.trim(),
                      );
                      setEventComments((prev) => [created, ...prev]);
                      setEventCommentText('');
                    } catch (err) {
                      setError(err instanceof ApiError ? err.message : 'Failed to post comment');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                >
                  Post Comment
                </button>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="pixel-btn"
                onClick={confirmJoinEvent}
                disabled={submitting}
              >
                {submitting ? 'Joining...' : 'Join Event'}
              </button>
              <button
                className="pixel-btn pixel-btn--secondary"
                onClick={() => setSelectedEvent(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedQuest && (
        <div
          className="modal-overlay"
          onClick={() => !submitting && resetJoinModal()}
        >
          <div className="modal pixel-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Join {selectedQuest.title}</h3>
              <button
                className="modal__close"
                onClick={() => resetJoinModal()}
              >
                ✖
              </button>
            </div>
            <div className="modal__body">
              <p>Created by {selectedQuest.author}.</p>
              <p>Complete the quest for +1 XP and +1 coin (not your own quests).</p>
              {selectedQuest.trackingType === 'numeric' ? (
                <div className="modal__field">
                  <label>Current progress ({selectedQuest.unit}):</label>
                  <input
                    type="number"
                    value={publicProgress}
                    onChange={(e) => setPublicProgress(e.target.value)}
                    className="pixel-input"
                    placeholder={`0 – ${selectedQuest.targetValue}`}
                  />
                </div>
              ) : (
                <div className="modal__field">
                  <label>Mark as completed:</label>
                  <div className="modal__toggle-row">
                    <span>Ticking this will complete the quest.</span>
                  </div>
                </div>
              )}
              <div className="modal__field">
                <label>
                  Proof {selectedQuest.proofRequired === 'text' || selectedQuest.proofRequired === 'image' ? '(required)' : '(optional)'}:
                </label>
                {selectedQuest.proofRequired === 'text' && (
                <textarea
                  value={publicNote}
                  onChange={(e) => setPublicNote(e.target.value)}
                  className="pixel-input pixel-input--textarea"
                  rows={3}
                  placeholder="Describe your completion..."
                />
              )}
              {selectedQuest.proofRequired === 'image' && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPublicProofImage(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setPublicProofPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="pixel-input"
                  />
                  {publicProofPreview && (
                    <div className="image-preview" style={{ marginTop: '0.5rem' }}>
                      <img src={publicProofPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', border: '2px solid var(--pixel-border)' }} />
                    </div>
                  )}
                </>
              )}
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="pixel-btn"
                onClick={confirmJoinQuest}
                disabled={
                  submitting ||(selectedQuest.proofRequired === 'text' && !publicNote.trim()) ||
                  (selectedQuest.proofRequired === 'image' && !publicProofImage)}
              >
                {submitting ? 'Joining...' : 'Join Quest'}
              </button>
              <button
                className="pixel-btn pixel-btn--secondary"
                onClick={() => setSelectedQuest(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => !submitting && setShowCreateModal(false)}
        >
          <div
            className="modal pixel-card modal--large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3>📜 Create Public Quest</h3>
              <button
                className="modal__close"
                onClick={() => setShowCreateModal(false)}
              >
                ✖
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__field">
                <label>Quest Title:</label>
                <input
                  type="text"
                  value={newPublicQuest.title}
                  onChange={(e) =>
                    setNewPublicQuest({ ...newPublicQuest, title: e.target.value })
                  }
                  className="pixel-input"
                />
              </div>
              <div className="modal__field">
                <label>Description:</label>
                <textarea
                  value={newPublicQuest.description}
                  onChange={(e) =>
                    setNewPublicQuest({
                      ...newPublicQuest,
                      description: e.target.value,
                    })
                  }
                  className="pixel-input pixel-input--textarea"
                  rows={2}
                />
              </div>
              <div className="modal__field">
                <label>Icon:</label>
                <div className="modal__icon-grid">
                  {availableIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`modal__icon-btn ${newPublicQuest.icon === icon ? 'active' : ''}`}
                      onClick={() =>
                        setNewPublicQuest({ ...newPublicQuest, icon })
                      }
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
                    onChange={(e) =>
                      setNewPublicQuest({
                        ...newPublicQuest,
                        category: e.target.value as 'fitness' | 'education' | 'creativity' | 'wellness' | 'other',
                      })
                    }
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
                    onChange={(e) =>
                      setNewPublicQuest({
                        ...newPublicQuest,
                        difficulty: e.target
                          .value as 'easy' | 'medium' | 'hard',
                      })
                    }
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
                  <label>Tracking:</label>
                  <select
                    value={newPublicQuest.trackingType}
                    onChange={(e) =>
                      setNewPublicQuest({
                        ...newPublicQuest,
                        trackingType: e.target
                          .value as typeof newPublicQuest.trackingType,
                      })
                    }
                    className="pixel-input"
                  >
                    <option value="binary">Yes/No</option>
                    <option value="numeric">Numeric</option>
                  </select>
                </div>
                <div className="modal__field">
                  <label>Proof Required:</label>
                  <select
                    value={newPublicQuest.proofRequired}
                    onChange={(e) =>
                      setNewPublicQuest({
                        ...newPublicQuest,
                        proofRequired: e.target
                          .value as typeof newPublicQuest.proofRequired,
                      })
                    }
                    className="pixel-input"
                  >
                    <option value="none">None</option>
                    <option value="text">Text proof</option>
                    <option value="image">Image proof</option>
                  </select>
                </div>
                <div className="modal__field">
                  <label>Target:</label>
                  <input
                    type="number"
                    value={newPublicQuest.targetValue}
                    onChange={(e) =>
                      setNewPublicQuest({
                        ...newPublicQuest,
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
                    value={newPublicQuest.unit}
                    onChange={(e) =>
                      setNewPublicQuest({ ...newPublicQuest, unit: e.target.value })
                    }
                    className="pixel-input"
                  />
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="pixel-btn"
                onClick={handleCreatePublicQuest}
                disabled={!newPublicQuest.title || submitting}
              >
                Publish Quest
              </button>
              <button
                className="pixel-btn pixel-btn--secondary"
                onClick={() => setShowCreateModal(false)}
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
