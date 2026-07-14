import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '../services/api';

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    eventsApi.getMyEvents()
      .then(res => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="page-header">
        <div>
          <h1 className="page-title">My Events</h1>
          <p className="page-subtitle">Events you've created as an organizer</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/create-event')}>
          + Create Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎭</div>
          <h3>No events created yet</h3>
          <p style={{ marginBottom: '1.5rem' }}>Start organizing your first event</p>
          <button className="btn btn-primary" onClick={() => navigate('/create-event')}>
            Create Event
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Type</th>
                <th>Date</th>
                <th>Tickets</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${event.id}`)}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{event.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {event.location}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{event.type}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {event.availableTickets} / {event.totalTickets}
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                    {event.price === 0 ? 'Free' : `$${event.price}`}
                  </td>
                  <td>
                    <span className={`badge badge-${event.status.toLowerCase()}`}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status guide */}
      <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>Event Status Guide</h4>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          <span><span className="badge badge-pending">PENDING</span> &nbsp;Awaiting admin approval</span>
          <span><span className="badge badge-approved">APPROVED</span> &nbsp;Live and visible to users</span>
          <span><span className="badge badge-rejected">REJECTED</span> &nbsp;Not approved by admin</span>
        </div>
      </div>
    </div>
  );
}
