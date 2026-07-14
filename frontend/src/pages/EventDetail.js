import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TYPE_ICONS = {
  CONCERT: '🎵',
  CONFERENCE: '🎤',
  WORKSHOP: '🛠️',
  SPORTS: '⚽',
  ART: '🎨',
  FOOD: '🍕',
  TECH: '💻',
  NETWORKING: '🤝',
  OTHER: '🎉'
};

const API_BASE = 'http://localhost:8080';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    eventsApi.getById(id)
      .then(res => setEvent(res.data))
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!event) return null;

  const formattedDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const imageUrl = event.imageUrl || null;

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '860px' }}>

      {/* Back */}
      <button
        className="btn btn-outline btn-sm"
        onClick={() => navigate('/events')}
        style={{ marginBottom: '1.5rem' }}
      >
        ← Back to Events
      </button>

      {/* IMAGE */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={event.title}
          loading="lazy"
          style={{
            width: '100%',
            height: '380px',
            objectFit: 'cover',
            borderRadius: '20px',
            marginBottom: '2rem',
            backgroundColor: '#111',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '280px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0c4a6e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '6rem',
          marginBottom: '2rem'
        }}>
          {TYPE_ICONS[event.type] || '🎉'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>

        {/* LEFT */}
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: 'rgba(79,70,229,0.15)', color: '#818cf8' }}>
              {TYPE_ICONS[event.type]} {event.type}
            </span>

            <span className={`badge badge-${event.status.toLowerCase()}`}>
              {event.status}
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>
            {event.title}
          </h1>

          {event.description && (
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              {event.description}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.3rem' }}>📅</span>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Date & Time
                </div>
                <div style={{ fontWeight: '500' }}>
                  {formattedDate}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.3rem' }}>📍</span>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Location
                </div>
                <div style={{ fontWeight: '500' }}>
                  {event.location}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.3rem' }}>👤</span>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Organized by
                </div>
                <div style={{ fontWeight: '500' }}>
                  {event.organizerUsername}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '80px' }}>
            <div className="card-body">

              <div style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: 'var(--primary)',
                marginBottom: '0.25rem'
              }}>
                {event.price === 0 ? 'Free' : `$${event.price}`}
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                per ticket
              </p>

              {/* tickets */}
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '10px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.4rem'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Available
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                    {event.availableTickets} / {event.totalTickets}
                  </span>
                </div>

                <div style={{
                  height: '6px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '3px'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(event.availableTickets / event.totalTickets) * 100}%`,
                    background: 'var(--primary)',
                    borderRadius: '3px',
                    transition: 'width 0.5s'
                  }} />
                </div>
              </div>

              {/* BOOK — hidden for organizers */}
              {event.availableTickets > 0 && user?.role !== 'ORGANIZER' ? (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    if (!user) {
                      navigate('/login');
                      return;
                    }
                    navigate(`/events/${event.id}/book`, {
                      state: { event }
                    });
                  }}
                >
                  🎫 Book Ticket
                </button>
              ) : event.availableTickets <= 0 ? (
                <button
                  className="btn"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: 'rgba(239,68,68,0.1)',
                    color: '#f87171'
                  }}
                  disabled
                >
                  Sold Out
                </button>
              ) : null}

              {!user && (
                <p style={{
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.75rem'
                }}>
                  <span
                    onClick={() => navigate('/login')}
                    style={{ color: 'var(--primary)', cursor: 'pointer' }}
                  >
                    Sign in
                  </span>
                  {' '}to book
                </p>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}