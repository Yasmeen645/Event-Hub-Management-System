import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '../services/api';

const EVENT_TYPES = ['CONCERT', 'CONFERENCE', 'WORKSHOP', 'SPORTS', 'ART', 'FOOD', 'TECH', 'NETWORKING', 'OTHER'];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', type: 'TECH', location: '',
    eventDate: '', totalTickets: '', price: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      const eventBlob = new Blob([JSON.stringify({
        ...form,
        totalTickets: parseInt(form.totalTickets),
        price: parseFloat(form.price),
        eventDate: new Date(form.eventDate).toISOString(),
      })], { type: 'application/json' });
      formData.append('event', eventBlob);
      if (image) formData.append('image', image);

      await eventsApi.create(formData);
      setSuccess('Event created! It will be visible after admin approval.');
      setTimeout(() => navigate('/my-events'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '680px' }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate('/my-events')} style={{ marginBottom: '1.5rem' }}>
        ← Back
      </button>

      <div className="page-header">
        <h1 className="page-title">Create New Event</h1>
        <p className="page-subtitle">Fill in the details below. Your event will be reviewed by an admin.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Image Upload */}
            <div className="form-group">
              <label className="form-label">Event Image</label>
              <div
                style={{
                  border: '2px dashed var(--border)', borderRadius: '12px',
                  padding: '1.5rem', textAlign: 'center', cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  background: imagePreview ? 'transparent' : 'rgba(255,255,255,0.02)'
                }}
                onClick={() => document.getElementById('imageInput').click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }} />
                ) : (
                  <>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Click to upload event image</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>PNG, JPG up to 10MB</p>
                  </>
                )}
              </div>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Event Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Give your event a great name"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                placeholder="Tell people what your event is about..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Event Type *</label>
                <select
                  className="form-control"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  required
                >
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Cairo Opera House"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date & Time *</label>
              <input
                type="datetime-local"
                className="form-control"
                value={form.eventDate}
                onChange={e => setForm({ ...form, eventDate: e.target.value })}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Total Tickets *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 100"
                  value={form.totalTickets}
                  onChange={e => setForm({ ...form, totalTickets: e.target.value })}
                  required
                  min={1}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price (USD) *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0 for free"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  required
                  min={0}
                  step="0.01"
                />
              </div>
            </div>

            <div style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.2)', borderRadius: '10px', padding: '0.9rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#818cf8' }}>
              ℹ️ Your event will be submitted for admin review. Once approved, it will appear in the public listings.
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : '🚀 Submit Event for Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
