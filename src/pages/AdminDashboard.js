import React, { useState, useEffect } from 'react';
import { eventsApi, usersApi } from '../services/api';

export default function AdminDashboard() {
  const [tab, setTab] = useState('pending');
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes, usersRes] = await Promise.all([
        eventsApi.getPending(),
        eventsApi.getAllAdmin(),
        usersApi.getAll(),
      ]);
      setPendingEvents(pendingRes.data);
      setAllEvents(allRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Admin fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (eventId, approved) => {
    setActionLoading(eventId);
    try {
      await eventsApi.approve(eventId, { approved, reason: approved ? 'Approved by admin' : 'Rejected by admin' });
      setMessage(`Event ${approved ? 'approved' : 'rejected'} successfully`);
      fetchAll();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleUser = async (userId) => {
    setActionLoading(`user-${userId}`);
    try {
      await usersApi.toggleStatus(userId);
      fetchAll();
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const stats = [
    { label: 'Pending Review', value: pendingEvents.length, color: '#f59e0b', icon: '⏳' },
    { label: 'Total Events', value: allEvents.length, color: '#4f46e5', icon: '🎭' },
    { label: 'Total Users', value: users.length, color: '#06b6d4', icon: '👥' },
    { label: 'Active Users', value: users.filter(u => u.active).length, color: '#10b981', icon: '✅' },
  ];

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage events, users, and platform settings</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {stats.map(stat => (
          <div key={stat.label} className="card">
            <div className="card-body" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {[
          { key: 'pending', label: `⏳ Pending (${pendingEvents.length})` },
          { key: 'events', label: '🎭 All Events' },
          { key: 'users', label: '👥 Users' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '0.6rem 1.2rem',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${tab === t.key ? 'var(--primary)' : 'transparent'}`,
              color: tab === t.key ? 'var(--text)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              fontWeight: tab === t.key ? '600' : '400',
              transition: 'all 0.2s',
              marginBottom: '-1px',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Pending Events Tab */}
      {tab === 'pending' && (
        pendingEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <h3>No pending events</h3>
            <p>All events have been reviewed</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingEvents.map(event => (
              <div key={event.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span className="badge badge-pending">PENDING</span>
                        <span className="badge" style={{ background: 'rgba(79,70,229,0.15)', color: '#818cf8' }}>{event.type}</span>
                      </div>
                      <h3 style={{ marginBottom: '0.5rem' }}>{event.title}</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <span>📅 {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span>📍 {event.location}</span>
                        <span>👤 Organizer: <strong style={{ color: 'var(--text)' }}>{event.organizerUsername}</strong></span>
                        <span>🎟️ {event.totalTickets} tickets · 💰 {event.price === 0 ? 'Free' : `$${event.price}`}</span>
                        {event.description && <span style={{ marginTop: '0.25rem' }}>{event.description.slice(0, 120)}{event.description.length > 120 ? '...' : ''}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApproval(event.id, true)}
                        disabled={actionLoading === event.id}
                      >
                        {actionLoading === event.id ? '...' : '✓ Approve'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleApproval(event.id, false)}
                        disabled={actionLoading === event.id}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* All Events Tab */}
      {tab === 'events' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Organizer</th>
                <th>Type</th>
                <th>Date</th>
                <th>Tickets</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allEvents.map(event => (
                <tr key={event.id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{event.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{event.location}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{event.organizerUsername}</td>
                  <td><span style={{ fontSize: '0.82rem' }}>{event.type}</span></td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{event.availableTickets}/{event.totalTickets}</td>
                  <td><span className={`badge badge-${event.status.toLowerCase()}`}>{event.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ fontWeight: '600' }}>{user.username}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</td>
                  <td>
                    <span className="badge" style={{
                      background: user.role === 'ADMIN' ? 'rgba(239,68,68,0.15)' :
                                  user.role === 'ORGANIZER' ? 'rgba(79,70,229,0.15)' : 'rgba(16,185,129,0.15)',
                      color: user.role === 'ADMIN' ? '#f87171' :
                             user.role === 'ORGANIZER' ? '#818cf8' : '#34d399'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.active ? 'badge-approved' : 'badge-rejected'}`}>
                      {user.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    {user.role !== 'ADMIN' && (
                      <button
                        className={`btn btn-sm ${user.active ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleUser(user.id)}
                        disabled={actionLoading === `user-${user.id}`}
                      >
                        {actionLoading === `user-${user.id}` ? '...' : user.active ? 'Disable' : 'Enable'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
