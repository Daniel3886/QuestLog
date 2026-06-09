// components/BugReportButton.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import ErrorBanner from './ErrorBanner';

type BugReport = {
  id: string;
  userId: string;
  userName: string;
  description: string;
  status: 'new' | 'in_progress' | 'completed';
  answer?: string;
  createdAt: string;
};

export default function BugReportButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const [reports, setReports] = useState<BugReport[]>([]);
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReports = async () => {
    try {
      const data = await apiFetch<BugReport[]>('/bug-reports');
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    }
  };

  const submitReport = async () => {
    if (!newDescription.trim()) return;
    setLoading(true);
    try {
      await apiFetch('/bug-reports', {
        method: 'POST',
        body: JSON.stringify({ description: newDescription.trim() }),
      });
      setNewDescription('');
      await loadReports();
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modalOpen) loadReports();
  }, [modalOpen]);

  return (
    <>
      <button className="pixel-btn pixel-btn--small" onClick={() => setModalOpen(true)}>
        🐞 Report Bug
      </button>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal pixel-card modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Bug Reports</h3>
              <button className="modal__close" onClick={() => setModalOpen(false)}>✖</button>
            </div>
            <div className="modal__body">
              <ErrorBanner message={error} onDismiss={() => setError('')} />
              <div className="bug-report-form">
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the bug... (what happened, steps to reproduce)"
                  className="pixel-input"
                  rows={3}
                />
                <button className="pixel-btn" onClick={submitReport} disabled={loading || !newDescription.trim()}>
                  Submit Report
                </button>
              </div>
              <div className="bug-report-list">
                <h4>Your reports</h4>
                {reports.length === 0 && <p>No reports yet.</p>}
                {reports.map(report => (
                  <div key={report.id} className="bug-report-item pixel-card">
                    <div className="bug-header">
                      <span className="bug-status" data-status={report.status}>{report.status.replace('_', ' ')}</span>
                      <span className="bug-date">{new Date(report.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="bug-description">{report.description}</div>
                    {report.answer && <div className="bug-answer"><strong>Answer:</strong> {report.answer}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}