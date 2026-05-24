'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ApiError, questsApi, usersApi } from '@/lib/api';
import { frequencyMap, trackingMap } from '@/lib/enums';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { LobbyQuest, UserProfile } from '@/lib/types';
import ErrorBanner from '@/components/ErrorBanner';
import './lobby.scss';

const availableIcons = ['🏃', '📚', '🧘', '💪', '🗣️', '🎨', '🎸', '🍳', '💧', '🌟'];

export default function LobbyPage() {
  const ready = useRequireAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [quests, setQuests] = useState<LobbyQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuest, setSelectedQuest] = useState<LobbyQuest | null>(null);
  const [showForgeModal, setShowForgeModal] = useState(false);
  const [logValue, setLogValue] = useState('');
  const [logNote, setLogNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    type: 'daily' as 'daily' | 'weekly' | 'custom',
    trackingType: 'binary' as 'binary' | 'numeric' | 'timer',
    targetValue: 1,
    unit: 'times',
    icon: '⚔️',
  });

  const loadData = useCallback(async () => {
    setError('');
    try {
      const [profile, questList] = await Promise.all([
        usersApi.me(),
        questsApi.listPersonal(),
      ]);
      setUser(profile);
      setQuests(questList);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load lobby');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) {
      loadData();
    }
  }, [ready, loadData]);

  const handleLogProgress = (quest: LobbyQuest) => {
    setSelectedQuest(quest);
    setLogValue('');
    setLogNote('');
  };

  const submitProgress = async () => {
    if (!selectedQuest) return;
    const increment = parseFloat(logValue);
    if (Number.isNaN(increment)) return;

    const newCurrent = Math.min(
      selectedQuest.currentValue + increment,
      selectedQuest.targetValue,
    );

    setSubmitting(true);
    setError('');
    try {
      await questsApi.updateProgress(selectedQuest.id, {
        currentValue: newCurrent,
        note: logNote || undefined,
      });
      setSelectedQuest(null);
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to log progress');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateQuest = async () => {
    if (!newQuest.title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await questsApi.createPersonal({
        title: newQuest.title,
        description: newQuest.description || undefined,
        icon: newQuest.icon,
        trackingType: trackingMap[newQuest.trackingType],
        targetValue: newQuest.targetValue,
        unit: newQuest.unit,
        frequency: frequencyMap[newQuest.type],
      });
      setShowForgeModal(false);
      setNewQuest({
        title: '',
        description: '',
        type: 'daily',
        trackingType: 'binary',
        targetValue: 1,
        unit: 'times',
        icon: '⚔️',
      });
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create quest');
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready || loading) {
    return <div className="lobby"><p>Loading lobby...</p></div>;
  }

  const calculateProgress = (quest: LobbyQuest) =>
    (quest.currentValue / quest.targetValue) * 100;

  const getQuestStatusIcon = (quest: LobbyQuest) => {
    if (quest.currentValue >= quest.targetValue) return '✅';
    if (quest.type === 'daily') return '🌞';
    if (quest.type === 'weekly') return '📅';
    return '⚔️';
  };

  const getXpPercentage = () =>
    user ? (user.xp / user.xpNext) * 100 : 0;

  const dailyQuestCount = quests.filter((q) => q.type === 'daily').length;

  return (
    <div className="lobby">
      <div className="lobby__particles"></div>
      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {user && (
        <div className="lobby__header">
          <div className="lobby__character">
            <div className="lobby__character-avatar">
              <span className="lobby__character-sprite">{user.avatar}</span>
              <div className="lobby__character-level">Lv.{user.level}</div>
            </div>
            <div className="lobby__character-stats">
              <div className="lobby__xp-bar">
                <div
                  className="lobby__xp-fill"
                  style={{ width: `${getXpPercentage()}%` }}
                ></div>
                <span className="lobby__xp-text">
                  {user.xp}/{user.xpNext} XP
                </span>
              </div>
              <div className="lobby__stat-row">
                <span className="lobby__stat">💰 {user.coins} coins</span>
                <span className="lobby__stat">🔥 {user.streak} day streak</span>
                <span className="lobby__stat">
                  📆 {user.weekStreak}/7 this week
                </span>
              </div>
            </div>
          </div>

          <div className="lobby__daily-summary">
            <div className="lobby__daily-icon">📋</div>
            <div className="lobby__daily-text">
              <span className="lobby__daily-label">Today&apos;s Progress</span>
              <span className="lobby__daily-value">
                {user.completedToday}/{dailyQuestCount || user.dailyQuestCount}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="lobby__quests-header">
        <h2 className="pixel-heading">📜 ACTIVE QUESTS 📜</h2>
      </div>

      <div className="lobby__quests-grid">
        {quests.length === 0 && (
          <p>No quests yet. Forge your first quest below.</p>
        )}
        {quests.map((quest) => (
          <div key={quest.id} className="quest-card pixel-card">
            <div className="quest-card__icon">{quest.icon}</div>
            <div className="quest-card__content">
              <div className="quest-card__header">
                <h3>{quest.title}</h3>
                <span className="quest-card__status">
                  {getQuestStatusIcon(quest)}
                </span>
              </div>
              <p className="quest-card__description">{quest.description}</p>

              <div className="quest-card__progress">
                <div className="quest-card__progress-bar">
                  <div
                    className="quest-card__progress-fill"
                    style={{ width: `${calculateProgress(quest)}%` }}
                  ></div>
                </div>
                <span className="quest-card__progress-text">
                  {quest.currentValue}/{quest.targetValue} {quest.unit}
                </span>
              </div>

              <div className="quest-card__footer">
                <span className="quest-card__streak">
                  🔥 Streak: {quest.streak}
                </span>
                {quest.currentValue < quest.targetValue ? (
                  <button
                    className="pixel-btn pixel-btn--small"
                    onClick={() => handleLogProgress(quest)}
                  >
                    Log Progress
                  </button>
                ) : (
                  <span className="quest-card__completed">Completed! ✅</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="lobby__forge">
        <div className="lobby__forge-icon">⚒️</div>
        <div className="lobby__forge-text">
          <span>QUEST FORGE</span>
          <small>Create custom quests and forge your legend</small>
        </div>
        <button className="pixel-btn" onClick={() => setShowForgeModal(true)}>
          Forge New Quest
        </button>
      </div>

      {showForgeModal && (
        <div
          className="modal-overlay"
          onClick={() => !submitting && setShowForgeModal(false)}
        >
          <div className="modal pixel-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>⚒️ Forge New Quest</h3>
              <button
                className="modal__close"
                onClick={() => setShowForgeModal(false)}
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
                      className={`modal__icon-btn ${newQuest.icon === icon ? 'active' : ''}`}
                      onClick={() => setNewQuest({ ...newQuest, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal__row">
                <div className="modal__field">
                  <label>Type:</label>
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
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="modal__field">
                  <label>Tracking:</label>
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
                    className="pixel-input"
                  />
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="pixel-btn"
                onClick={handleCreateQuest}
                disabled={!newQuest.title || submitting}
              >
                ⚒️ Forge Quest
              </button>
              <button
                className="pixel-btn pixel-btn--secondary"
                onClick={() => setShowForgeModal(false)}
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
          onClick={() => !submitting && setSelectedQuest(null)}
        >
          <div className="modal pixel-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Log Progress</h3>
              <button
                className="modal__close"
                onClick={() => setSelectedQuest(null)}
              >
                ✖
              </button>
            </div>
            <div className="modal__body">
              <p>
                <strong>{selectedQuest.title}</strong> –{' '}
                {selectedQuest.description}
              </p>
              <div className="modal__field">
                <label>Amount ({selectedQuest.unit}):</label>
                <input
                  type="number"
                  value={logValue}
                  onChange={(e) => setLogValue(e.target.value)}
                  className="pixel-input"
                />
              </div>
              <div className="modal__field">
                <label>Note (optional):</label>
                <textarea
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  className="pixel-input pixel-input--textarea"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="pixel-btn"
                onClick={submitProgress}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Submit'}
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
    </div>
  );
}
