import React, { useEffect, useState } from 'react';
import { notificationsApi } from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.getMy()
      .then(res => {
        setNotifications(res.data);
        // Mark all unread as read
        res.data
          .filter(n => !n.read)
          .forEach(n => notificationsApi.markRead(n.id).catch(() => {}));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '700px' }}>
      <div className="page-header">
        <h1 className="page-title">🔔 Notifications</h1>
        <p className="page-subtitle">Your latest updates and alerts</p>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <h3>No notifications yet</h3>
          <p>You'll be notified when something happens</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map(n => (
            <div
              key={n.id}
              className="card"
              style={{
                borderLeft: n.read ? '3px solid transparent' : '3px solid var(--primary)',
                opacity: n.read ? 0.75 : 1,
              }}
            >
              <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: n.read ? '400' : '600', marginBottom: '0.25rem' }}>
                      {n.title && <span style={{ marginRight: '0.5rem' }}>{n.title}</span>}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      {n.message}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {formatDate(n.createdAt)}
                  </div>
                </div>
                {!n.read && (
                  <div style={{
                    display: 'inline-block',
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    marginTop: '0.5rem'
                  }} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
