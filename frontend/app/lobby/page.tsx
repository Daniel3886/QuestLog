// app/lobby/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import './lobby.scss';

// Types
interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'custom';
  trackingType: 'binary' | 'numeric' | 'timer';
  targetValue: number;
  currentValue: number;
  unit: string;
  streak: number;
  icon: string;
}

interface UserStats {
  level: number;
  xp: number;
  xpNext: number;
  coins: number;
  streak: number;
  weekStreak: number;
  totalQuests: number;
  completedToday: number;
}

// Mock data
const mockUser: UserStats = {
  level: 7,
  xp: 342,
  xpNext: 500,
  coins: 1250,
  streak: 23,
  weekStreak: 6,
  totalQuests: 47,
  completedToday: 2,
};

const mockQuests: Quest[] = [
  {
    id: '1',
    title: 'Morning Run',
    description: 'Go for a 30-minute run',
    type: 'daily',
    trackingType: 'numeric',
    targetValue: 3,
    currentValue: 0,
    unit: 'km',
    streak: 12,
    icon: '🏃',
  },
  {
    id: '2',
    title: 'Read Daily',
    description: 'Read 20 pages of any book',
    type: 'daily',
    trackingType: 'numeric',
    targetValue: 20,
    currentValue: 0,
    unit: 'pages',
    streak: 8,
    icon: '📚',
  },
  {
    id: '3',
    title: 'Meditate',
    description: '10 minutes of mindfulness',
    type: 'daily',
    trackingType: 'timer',
    targetValue: 10,
    currentValue: 0,
    unit: 'min',
    streak: 21,
    icon: '🧘',
  },
  {
    id: '4',
    title: 'Weekly Workout',
    description: 'Complete 5 workouts this week',
    type: 'weekly',
    trackingType: 'numeric',
    targetValue: 5,
    currentValue: 2,
    unit: 'workouts',
    streak: 3,
    icon: '💪',
  },
  {
    id: '5',
    title: 'Learn Language',
    description: 'Study 30 minutes of Spanish',
    type: 'daily',
    trackingType: 'timer',
    targetValue: 30,
    currentValue: 0,
    unit: 'min',
    streak: 4,
    icon: '🗣️',
  },
];

// Available icons for quest creation
const availableIcons = ['🏃', '📚', '🧘', '💪', '🗣️', '🎨', '🎸', '🍳', '💧', '🌟'];

export default function LobbyPage() {
  const [quests, setQuests] = useState<Quest[]>(mockQuests);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showForgeModal, setShowForgeModal] = useState(false);
  const [logValue, setLogValue] = useState<string>('');
  const [logNote, setLogNote] = useState<string>('');
  
  // New quest form state
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    type: 'daily' as 'daily' | 'weekly' | 'custom',
    trackingType: 'binary' as 'binary' | 'numeric' | 'timer',
    targetValue: 1,
    unit: 'times',
    icon: '⚔️',
  });

  const handleLogProgress = (quest: Quest) => {
    setSelectedQuest(quest);
    setLogValue('');
    setLogNote('');
  };

  const submitProgress = () => {
    if (!selectedQuest) return;
    
    const value = parseFloat(logValue);
    if (isNaN(value)) return;
    
    setQuests(prev => prev.map(q => {
      if (q.id === selectedQuest.id) {
        const newCurrent = Math.min(q.currentValue + value, q.targetValue);
        return { ...q, currentValue: newCurrent };
      }
      return q;
    }));
    
    setSelectedQuest(null);
  };

  const handleCreateQuest = () => {
    const quest: Quest = {
      id: Date.now().toString(),
      title: newQuest.title,
      description: newQuest.description,
      type: newQuest.type,
      trackingType: newQuest.trackingType,
      targetValue: newQuest.targetValue,
      currentValue: 0,
      unit: newQuest.unit,
      streak: 0,
      icon: newQuest.icon,
    };
    
    setQuests(prev => [quest, ...prev]);
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
  };

  const calculateProgress = (quest: Quest): number => {
    return (quest.currentValue / quest.targetValue) * 100;
  };

  const getQuestStatusIcon = (quest: Quest): string => {
    if (quest.currentValue >= quest.targetValue) return '✅';
    if (quest.type === 'daily') return '🌞';
    if (quest.type === 'weekly') return '📅';
    return '⚔️';
  };

  const getXpPercentage = () => (mockUser.xp / mockUser.xpNext) * 100;

  return (
    <div className="lobby">
      {/* Pixel particles background */}
      <div className="lobby__particles"></div>

      {/* Header with character stats */}
      <div className="lobby__header">
        <div className="lobby__character">
          <div className="lobby__character-avatar">
            <span className="lobby__character-sprite">🧙</span>
            <div className="lobby__character-level">Lv.{mockUser.level}</div>
          </div>
          <div className="lobby__character-stats">
            <div className="lobby__xp-bar">
              <div className="lobby__xp-fill" style={{ width: `${getXpPercentage()}%` }}></div>
              <span className="lobby__xp-text">{mockUser.xp}/{mockUser.xpNext} XP</span>
            </div>
            <div className="lobby__stat-row">
              <span className="lobby__stat">💰 {mockUser.coins} coins</span>
              <span className="lobby__stat">🔥 {mockUser.streak} day streak</span>
              <span className="lobby__stat">📆 {mockUser.weekStreak}/7 this week</span>
            </div>
          </div>
        </div>

        <div className="lobby__daily-summary">
          <div className="lobby__daily-icon">📋</div>
          <div className="lobby__daily-text">
            <span className="lobby__daily-label">Today's Progress</span>
            <span className="lobby__daily-value">{mockUser.completedToday}/{quests.filter(q => q.type === 'daily').length}</span>
          </div>
        </div>
      </div>

      {/* Quests Header - removed duplicate button */}
      <div className="lobby__quests-header">
        <h2 className="pixel-heading">📜 ACTIVE QUESTS 📜</h2>
      </div>

      <div className="lobby__quests-grid">
        {quests.map((quest) => (
          <div key={quest.id} className="quest-card pixel-card">
            <div className="quest-card__icon">{quest.icon}</div>
            <div className="quest-card__content">
              <div className="quest-card__header">
                <h3>{quest.title}</h3>
                <span className="quest-card__status">{getQuestStatusIcon(quest)}</span>
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
                <span className="quest-card__streak">🔥 Streak: {quest.streak}</span>
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

      {/* Quest Forge - main creation area */}
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

      {/* Forge Modal (Create Quest) */}
      {showForgeModal && (
        <div className="modal-overlay" onClick={() => setShowForgeModal(false)}>
          <div className="modal pixel-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>⚒️ Forge New Quest</h3>
              <button className="modal__close" onClick={() => setShowForgeModal(false)}>✖</button>
            </div>
            <div className="modal__body">
              <div className="modal__field">
                <label>Quest Title:</label>
                <input 
                  type="text" 
                  value={newQuest.title} 
                  onChange={(e) => setNewQuest({...newQuest, title: e.target.value})}
                  placeholder="e.g., Read 30 minutes"
                  className="pixel-input"
                />
              </div>
              <div className="modal__field">
                <label>Description:</label>
                <textarea 
                  value={newQuest.description} 
                  onChange={(e) => setNewQuest({...newQuest, description: e.target.value})}
                  placeholder="What do you want to achieve?"
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
                      className={`modal__icon-btn ${newQuest.icon === icon ? 'active' : ''}`}
                      onClick={() => setNewQuest({...newQuest, icon})}
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
                    onChange={(e) => setNewQuest({...newQuest, type: e.target.value as any})}
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
                    onChange={(e) => setNewQuest({...newQuest, trackingType: e.target.value as any})}
                    className="pixel-input"
                  >
                    <option value="binary">Yes/No</option>
                    <option value="numeric">Numeric (e.g., km, pages)</option>
                    <option value="timer">Timer (minutes)</option>
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
                    placeholder="km, pages, min, times"
                    className="pixel-input"
                  />
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button className="pixel-btn" onClick={handleCreateQuest} disabled={!newQuest.title}>
                ⚒️ Forge Quest
              </button>
              <button className="pixel-btn pixel-btn--secondary" onClick={() => setShowForgeModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Progress Modal (unchanged) */}
      {selectedQuest && (
        <div className="modal-overlay" onClick={() => setSelectedQuest(null)}>
          <div className="modal pixel-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Log Progress</h3>
              <button className="modal__close" onClick={() => setSelectedQuest(null)}>✖</button>
            </div>
            <div className="modal__body">
              <p><strong>{selectedQuest.title}</strong> – {selectedQuest.description}</p>
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
                  placeholder="How did it go?"
                  className="pixel-input pixel-input--textarea"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal__footer">
              <button className="pixel-btn" onClick={submitProgress}>Submit</button>
              <button className="pixel-btn pixel-btn--secondary" onClick={() => setSelectedQuest(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}