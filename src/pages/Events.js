import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EVENT_TYPES = ['ALL', 'CONCERT', 'CONFERENCE', 'WORKSHOP', 'SPORTS', 'ART', 'FOOD', 'TECH', 'NETWORKING', 'OTHER'];

const TYPE_ICONS = {
  CONCERT: '🎵', CONFERENCE: '🎤', WORKSHOP: '🛠️', SPORTS: '⚽',
  ART: '🎨', FOOD: '🍕', TECH: '💻', NETWORKING: '🤝', OTHER: '🎉', ALL: '✨'
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventsApi.getAll(filter === 'ALL' ? null : filter);
      setEvents(res.data);
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (event) => {
    if (!user) { navigate('/login'); return; }
    navigate(`/events/${event.id}/book`, { state: { event } });
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="page-header">
        <h1 className="page-title">Discover Events</h1>
        <p className="page-subtitle">Find and book amazing events near you</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {EVENT_TYPES.map(type => (
          <button
            key={type}
            className={`filter-tab ${filter === type ? 'active' : ''}`}
            onClick={() => setFilter(type)}
          >
            {TYPE_ICONS[type]} {type}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎭</div>
          <h3>No events found</h3>
          <p>Try a different category or check back later</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <EventCard key={event.id} event={event} onBook={handleBook} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, onBook, user }) {
  const navigate = useNavigate();
  const formattedDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // ORGANIZER و ADMIN ميحجزوش
  const canBook = user?.role !== 'ORGANIZER' && user?.role !== 'ADMIN';

  return (
    <div className="card" style={{ cursor: 'pointer' }}>
      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt={event.title}
          className="card-img"
          onClick={() => navigate(`/events/${event.id}`)}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="card-img-placeholder" onClick={() => navigate(`/events/${event.id}`)}>
          {TYPE_ICONS[event.type] || '🎉'}
        </div>
      )}

      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <span className="badge" style={{ background: 'rgba(79,70,229,0.15)', color: '#818cf8' }}>
            {TYPE_ICONS[event.type]} {event.type}
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>
            {event.price === 0 ? 'Free' : `$${event.price}`}
          </span>
        </div>

        <h3
          style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', cursor: 'pointer' }}
          onClick={() => navigate(`/events/${event.id}`)}
        >
          {event.title}
        </h3>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          📅 {formattedDate}
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          📍 {event.location}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            🎟️ {event.availableTickets} left
          </span>

          {/* إظهار زرار Book فقط لو مش ORGANIZER أو ADMIN */}
          {canBook && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onBook(event)}
              disabled={event.availableTickets === 0}
            >
              {event.availableTickets === 0 ? 'Sold Out' : 'Book Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}