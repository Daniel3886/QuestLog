// components/EventManager.tsx
'use client';
import React, { useState } from 'react';
import { EventItem } from './AdminPanel'; // adjust import

export default function EventManager({
  events,
  onCreate,
  onUpdate,
  onDelete,
  loading,
}: {
  events: EventItem[];
  onCreate: (event: Omit<EventItem, 'id'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<EventItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}) {
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const eventData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        targetValue: parseFloat(formData.get('targetValue') as string),
        unit: formData.get('unit') as string,
        startDate: new Date(formData.get('startDate') as string).toISOString(),
        endDate: new Date(formData.get('endDate') as string).toISOString(),
        rewardCoins: parseInt(formData.get('rewardCoins') as string),
        rewardXp: parseInt(formData.get('rewardXp') as string),
        rewardItemName: (formData.get('rewardItemName') as string) || undefined,
        icon: (formData.get('icon') as string) || '🏆',
    };
    if (editingEvent) {
      await onUpdate(editingEvent.id, eventData);
      setEditingEvent(null);
    } else {
      await onCreate(eventData);
    }
    setShowForm(false);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h3>Global Events</h3>
        <button className="pixel-btn" onClick={() => { setEditingEvent(null); setShowForm(true); }}>
          + Create Event
        </button>
      </div>
      {showForm && (
        <form className="event-form pixel-card" onSubmit={handleSubmit}>
          <input name="title" placeholder="Title" defaultValue={editingEvent?.title || ''} required />
          <textarea name="description" placeholder="Description" defaultValue={editingEvent?.description || ''} required />
          <input name="targetValue" type="number" placeholder="Target value" defaultValue={editingEvent?.targetValue || 1} required />
          <input name="unit" placeholder="Unit (e.g., km)" defaultValue={editingEvent?.unit || ''} required />
          <input name="startDate" type="datetime-local" defaultValue={editingEvent?.startDate?.slice(0, 16) || ''} required />
          <input name="endDate" type="datetime-local" defaultValue={editingEvent?.endDate?.slice(0, 16) || ''} required />
          <input name="rewardCoins" type="number" placeholder="Coins" defaultValue={editingEvent?.rewardCoins || 0} required />
          <input name="rewardXp" type="number" placeholder="XP" defaultValue={editingEvent?.rewardXp || 0} required />
          <input name="rewardItemName" placeholder="Item name (optional)" defaultValue={editingEvent?.rewardItemName || ''} />
          <input name="icon" placeholder="Icon emoji" defaultValue={editingEvent?.icon || '🏆'} />
          <div className="form-actions">
            <button type="submit" className="pixel-btn">{editingEvent ? 'Update' : 'Create'}</button>
            <button type="button" className="pixel-btn pixel-btn--secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
      {loading && <p>Loading...</p>}
      <div className="events-list">
        {events.map(event => (
          <div key={event.id} className="event-item pixel-card">
            <div className="event-header">
              <span className="event-icon">{event.icon}</span>
              <span className="event-title">{event.title}</span>
              <span className="event-date">{new Date(event.startDate).toLocaleDateString()} → {new Date(event.endDate).toLocaleDateString()}</span>
            </div>
            <div className="event-actions">
              <button className="pixel-btn pixel-btn--small" onClick={() => { setEditingEvent(event); setShowForm(true); }}>Edit</button>
              <button className="pixel-btn pixel-btn--small pixel-btn--secondary" onClick={() => onDelete(event.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}