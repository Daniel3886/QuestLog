'use client';

import { useEffect, useState } from 'react';

export default function ErrorBanner({
  message,
  onDismiss,
  autoHideDuration = 5000, // optional: auto-hide after 5 seconds
}: {
  message: string;
  onDismiss?: () => void;
  autoHideDuration?: number;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!message) setVisible(false);
    else setVisible(true);
  }, [message]);

  useEffect(() => {
    if (autoHideDuration && message) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [message, autoHideDuration, onDismiss]);

  if (!message || !visible) return null;

  return (
    <div className="pixel-error-banner" role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss">
          ✖
        </button>
      )}
    </div>
  );
}