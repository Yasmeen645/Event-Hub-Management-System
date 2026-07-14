import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread notifications count every 30 seconds
  useEffect(() => {
    if (!user) return;
    const fetchCount = () => {
      notificationsApi.getUnreadCount()
        .then(res => setUnreadCount(res.data.count || 0))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Reset badge when visiting notifications page
  useEffect(() => {
    if (location.pathname === '/notifications') {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">⚡ EventHub</Link>

      <div className="navbar-links">
        <Link to="/events" className={isActive('/events')}>Browse</Link>

        {user && (
          <>
            <Link to="/my-tickets" className={isActive('/my-tickets')}>
              My Tickets
            </Link>

            {/* Only ORGANIZER sees My Events and + New Event */}
            {user.role === 'ORGANIZER' && (
              <Link to="/my-events" className={isActive('/my-events')}>
                My Events
              </Link>
            )}

            {user.role === 'ORGANIZER' && (
              <Link to="/create-event" className={isActive('/create-event')}>
                + New Event
              </Link>
            )}

            {/* ADMIN only sees Admin dashboard link */}
            {user.role === 'ADMIN' && (
              <Link to="/admin" className={isActive('/admin')}>
                Admin
              </Link>
            )}

            {/* NOTIFICATIONS with unread badge */}
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/notifications')}
              style={{ position: 'relative' }}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: '1',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </>
        )}

        {!user ? (
          <>
            <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              👤 {user.username}
              <span
                className="badge badge-approved"
                style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}
              >
                {user.role}
              </span>
            </span>

            <button
              className="btn btn-outline btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
