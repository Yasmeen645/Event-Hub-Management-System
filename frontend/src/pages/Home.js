import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    { icon: '🎭', title: 'Discover Events', desc: 'Browse concerts, workshops, tech talks, and more — filtered by category.' },
    { icon: '🎫', title: 'Book Instantly', desc: 'Reserve your spot in seconds and receive a downloadable PDF ticket.' },
    { icon: '🚀', title: 'Organize Events', desc: 'Create and manage events. Go live after a quick admin review.' },
    { icon: '🔒', title: 'Secure Payments', desc: 'Stripe-powered checkout with QR-code tickets for easy check-in.' },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 2rem',
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(79,70,229,0.2) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.15) 0%, transparent 55%),
          var(--bg)
        `,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative dots */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[...Array(20)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '50%',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }} />
          ))}
        </div>

        <div style={{ maxWidth: '700px', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.3)',
            borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.85rem',
            color: '#818cf8', marginBottom: '1.5rem'
          }}>
            ⚡ Your all-in-one event platform
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem' }}>
            Discover, Book &{' '}
            <span style={{
              background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Experience
            </span>{' '}
            Events
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '2.5rem' }}>
            From tech conferences to live concerts — find events that matter to you,
            book your spot in seconds, and get your digital ticket instantly.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
              onClick={() => navigate('/events')}
            >
              Explore Events →
            </button>
            {!user && (
              <button
                className="btn btn-outline"
                style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
                onClick={() => navigate('/register')}
              >
                Get Started Free
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container" style={{ paddingBottom: '6rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.75rem' }}>
          Everything you need
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>
          A complete platform for event attendees and organizers
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {features.map(f => (
            <div key={f.title} className="card" style={{ cursor: 'default' }}>
              <div className="card-body">
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.05rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {!user && (
          <div style={{
            marginTop: '4rem', textAlign: 'center', padding: '3rem',
            background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(6,182,212,0.1))',
            border: '1px solid rgba(79,70,229,0.2)', borderRadius: '20px'
          }}>
            <h2 style={{ marginBottom: '0.75rem' }}>Ready to get started?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Join thousands of event lovers on EventHub</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>Sign Up Free</button>
              <button className="btn btn-outline" onClick={() => navigate('/login')}>Sign In</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
