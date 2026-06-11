'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, commentsApi, apiFetch } from '@/lib/api';
import ErrorBanner from '@/components/ErrorBanner';
import './AdminPanel.scss';
import EventManager from './EventManager';

type ReportItem = {
  id: string;
  type: 'comment' | 'quest';
  content: string;
  questDescription?: string;
  creatorName: string;
  creatorId: string;
  reportedAt: string;
  reason: string;
  reporterId: string;
  reporterName: string;
};

type EventItem = {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue?: number;
  unit: string;
  startDate: string;
  endDate: string;
  rewardCoins: number;
  rewardXp: number;
  rewardItemName?: string;
  icon: string;
};

type BugReport = {
  id: string;
  userId: string;
  userName: string;
  description: string;
  status: 'new' | 'in_progress' | 'completed';
  answer?: string;
  createdAt: string;
};

type BannedUser = {
  id: string;
  userName: string;
  bannedAt: string;
  reason: string;
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'reports' | 'events' | 'bugReports' | 'banned'>('reports');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<ReportItem[]>('/admin/reports');
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const banUserWithReason = async (userId: string, reason: string, reportedItemId?: string) => {
    try {
      await apiFetch(`/admin/users/${userId}/ban`, {
        method: 'POST',
        body: JSON.stringify({ reason, reportedItemId }),
      });
      await loadReports(); // refresh reports
    } catch (err: any) {
      setError(err.message || 'Failed to ban user');
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      await adminApi.deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete report');
    }
  };

  const deleteQuest = async (reportId: string) => {
    try {
      await adminApi.deleteQuest(reportId);
      // Remove the report as well
      await adminApi.deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete quest');
    }
  };

  const deleteComment = async (reportId: string) => {
    try {
      await commentsApi.adminDelete(reportId);
      await adminApi.deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete comment');
    }
  };

  const restoreComment = async (reportId: string) => {
    try {
      await commentsApi.adminRestore(reportId);
      // Remove the report entry
      await adminApi.deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err: any) {
      setError(err.message || 'Failed to restore comment');
    }
  };

  // --- Event management ---
  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<EventItem[]>('/admin/events');
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (event: Omit<EventItem, 'id'>) => {
    try {
      const created = await apiFetch<EventItem>('/events', {
        method: 'POST',
        body: JSON.stringify(event),
      });
      setEvents(prev => [...prev, created]);
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    }
  };

  const updateEvent = async (id: string, updates: Partial<EventItem>) => {
    try {
      const updated = await apiFetch<EventItem>(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setEvents(prev => prev.map(e => (e.id === id ? updated : e)));
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event? All data will be lost.')) return;
    try {
      await apiFetch(`/events/${id}`, { method: 'DELETE' });
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
    }
  };

  // --- Bug reports (admin view) ---
  const loadBugReports = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<BugReport[]>('/admin/bug-reports');
      setBugReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bug reports');
    } finally {
      setLoading(false);
    }
  };

  const updateBugReport = async (id: string, status: BugReport['status'], answer?: string) => {
    try {
      const updated = await apiFetch<BugReport>(`/admin/bug-reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, answer }),
      });
      setBugReports(prev => prev.map(r => (r.id === id ? updated : r)));
    } catch (err: any) {
      setError(err.message || 'Failed to update bug report');
    }
  };

  // --- Banned users ---
  const loadBannedUsers = async () => {
  setLoading(true);
    try {
      const data = await apiFetch<{ id: string; username: string; bannedReason: string; bannedAt: string }[]>('/admin/banned-users');
      setBannedUsers(data.map(user => ({
        id: user.id,
        userName: user.username,
        reason: user.bannedReason,
        bannedAt: user.bannedAt,
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to load banned users');
    } finally {
      setLoading(false);
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      await apiFetch(`/admin/users/${userId}/unban`, { method: 'POST' });
      setBannedUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      setError(err.message || 'Failed to unban user');
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') loadReports();
    if (activeTab === 'events') loadEvents();
    if (activeTab === 'bugReports') loadBugReports();
    if (activeTab === 'banned') loadBannedUsers();
  }, [activeTab]);

  const renderReports = () => (
    <div className="admin-section">
      <h3>Reported Content</h3>
      {loading && <p>Loading...</p>}
      {reports.length === 0 && !loading && <p>No reported items.</p>}
      {reports.map(report => (
        <div key={report.id} className="report-item pixel-card">
          <div className="report-meta">
            <span className="report-type">{report.type}</span>
            <span>Reported item by <strong>{report.creatorName}</strong></span>
            <span>Reported by {report.reporterName}</span>
            <span className="report-date">{new Date(report.reportedAt).toLocaleString()}</span>
          </div>
          <div className="report-content">
            <strong>Content:</strong> {report.content}
            {report.questDescription && (
              <>
                <br /><strong>Description:</strong> {report.questDescription}
              </>
            )}
          </div>
          <div className="report-reason"><strong>Reason:</strong> {report.reason}</div>
          <div className="report-actions">
            <button className="pixel-btn pixel-btn--small" onClick={() => {
              const reason = prompt('Ban reason:');
              if (reason) banUserWithReason(report.creatorId, reason, report.id);
            }}>Ban user</button>
            <button className="pixel-btn pixel-btn--small" onClick={() => deleteReport(report.id)}>Delete report</button>
            {report.type === 'quest' && (
              <button className="pixel-btn pixel-btn--small pixel-btn--secondary" onClick={() => deleteQuest(report.id)}>Remove quest</button>
            )}
            {report.type === 'comment' && (
              <>
                <button className="pixel-btn pixel-btn--small pixel-btn--secondary" onClick={() => deleteComment(report.id)}>Delete comment</button>
                <button className="pixel-btn pixel-btn--small pixel-btn--secondary" onClick={() => restoreComment(report.id)}>Restore comment</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderBugReportsAdmin = () => (
    <div className="admin-section">
      <h3>Bug Reports (Admin)</h3>
      {loading && <p>Loading...</p>}
      {bugReports.map(report => (
        <div key={report.id} className="bug-report-item pixel-card">
          <div className="bug-header">
            <span className="bug-user">{report.userName}</span>
            <span className="bug-status" data-status={report.status}>{report.status.replace('_', ' ')}</span>
            <span className="bug-date">{new Date(report.createdAt).toLocaleString()}</span>
          </div>
          <div className="bug-description">{report.description}</div>
          <div className="bug-answer">{report.answer && <strong>Answer:</strong>} {report.answer}</div>
          <div className="bug-actions">
            <select
              value={report.status}
              onChange={(e) => updateBugReport(report.id, e.target.value as any, report.answer)}
              className="pixel-input"
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <textarea
              placeholder="Answer (optional)"
              value={report.answer || ''}
              onChange={(e) => updateBugReport(report.id, report.status, e.target.value)}
              className="pixel-input"
              rows={2}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderBannedUsers = () => (
    <div className="admin-section">
      <h3>Banned Users</h3>
      {loading && <p>Loading...</p>}
      {bannedUsers.length === 0 && !loading && <p>No banned users.</p>}
      {bannedUsers.map(user => (
        <div key={user.id} className="banned-item pixel-card">
          <div className="banned-info">
            <strong>{user.userName}</strong> – banned on {new Date(user.bannedAt).toLocaleDateString()}
            <br /><small>Reason: {user.reason}</small>
          </div>
          <button className="pixel-btn pixel-btn--small" onClick={() => unbanUser(user.id)}>Unban</button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="admin-panel">
      <ErrorBanner message={error} onDismiss={() => setError('')} />
      <div className="tabs">
        <button className={`tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>Reports</button>
        <button className={`tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>Events</button>
        <button className={`tab ${activeTab === 'bugReports' ? 'active' : ''}`} onClick={() => setActiveTab('bugReports')}>Bug Reports</button>
        <button className={`tab ${activeTab === 'banned' ? 'active' : ''}`} onClick={() => setActiveTab('banned')}>Banned Users</button>
      </div>
      <div className="tab-content">
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'events' && <EventManager
            events={events}
            onCreate={createEvent}
            onUpdate={updateEvent}
            onDelete={deleteEvent}
            loading={loading}
          />}
        {activeTab === 'bugReports' && renderBugReportsAdmin()}
        {activeTab === 'banned' && renderBannedUsers()}
      </div>
    </div>
  );
}