import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ticketsApi, paymentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookEvent() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const event = location.state?.event;

  const [step, setStep] = useState(1); // 1=review, 2=payment, 3=success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '', expiry: '', cvc: '', name: ''
  });

  if (!event) {
    navigate('/events');
    return null;
  }

  // Step 1: Book ticket (creates PENDING_PAYMENT ticket)
  const handleBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ticketsApi.book({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.eventDate,
        eventLocation: event.location,
        price: event.price,
      });
      setTicket(res.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Process payment
  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Create Stripe PaymentIntent
      const intentRes = await paymentsApi.createIntent({
        ticketId: ticket.id,
        amount: event.price,
        currency: 'usd',
        eventTitle: event.title,
      });

      // Confirm payment (in production use Stripe Elements)
      const paymentId = intentRes.data.paymentIntentId;
      await paymentsApi.confirm({ paymentIntentId: paymentId, ticketId: ticket.id });

      // Update ticket status
      await ticketsApi.confirmPayment(ticket.id, paymentId);

      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await ticketsApi.downloadPdf(ticket.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket_${ticket.ticketNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Download failed');
    }
  };

  const formattedDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '560px' }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/events/${id}`)} style={{ marginBottom: '1.5rem' }}>
        ← Back
      </button>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        {['Review', 'Payment', 'Ticket'].map((label, i) => (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: '700',
                color: step >= i + 1 ? 'white' : 'var(--text-muted)'
              }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '0.85rem', color: step === i + 1 ? 'var(--text)' : 'var(--text-muted)', fontWeight: step === i + 1 ? '600' : '400' }}>
                {label}
              </span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? 'var(--success)' : 'var(--border)' }} />}
          </React.Fragment>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ===== STEP 1: Review ===== */}
      {step === 1 && (
        <div className="card">
          <div className="card-body">
            <h2 style={{ marginBottom: '1.5rem' }}>Review Your Booking</h2>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>{event.title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>📅 {formattedDate}</span>
                <span>📍 {event.location}</span>
                <span>👤 Attendee: <strong style={{ color: 'var(--text)' }}>{user?.username}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderTop: '1px solid var(--border)', marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: '600' }}>Total</span>
              <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>
                {event.price === 0 ? 'FREE' : `$${event.price}`}
              </span>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleBooking}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Continue to Payment →'}
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 2: Payment ===== */}
      {step === 2 && (
        <div className="card">
          <div className="card-body">
            <h2 style={{ marginBottom: '0.5rem' }}>Payment Details</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Ticket reserved: <strong style={{ color: 'var(--primary)' }}>{ticket?.ticketNumber}</strong>
            </p>

            <form onSubmit={handlePayment}>
              <div className="form-group">
                <label className="form-label">Cardholder Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="John Doe"
                  value={paymentForm.name}
                  onChange={e => setPaymentForm({ ...paymentForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="4242 4242 4242 4242"
                  value={paymentForm.cardNumber}
                  onChange={e => setPaymentForm({ ...paymentForm, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Expiry</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="MM/YY"
                    value={paymentForm.expiry}
                    onChange={e => setPaymentForm({ ...paymentForm, expiry: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVC</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="123"
                    value={paymentForm.cvc}
                    onChange={e => setPaymentForm({ ...paymentForm, cvc: e.target.value.slice(0, 4) })}
                    required
                  />
                </div>
              </div>

              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#34d399' }}>
                🔒 Secured by Stripe. Your payment info is encrypted.
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border)', marginBottom: '1.25rem' }}>
                <span>Total Charge</span>
                <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.1rem' }}>
                  {event.price === 0 ? 'FREE' : `$${event.price}`}
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={loading}
              >
                {loading ? 'Processing payment...' : `Pay ${event.price === 0 ? 'Free' : `$${event.price}`} →`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== STEP 3: Success ===== */}
      {step === 3 && (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Booking Confirmed!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Your ticket has been booked successfully
            </p>

            <div style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Ticket Number</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)', fontFamily: 'monospace' }}>
                {ticket?.ticketNumber}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={handleDownload}>
                📥 Download Ticket PDF
              </button>
              <button className="btn btn-outline" style={{ justifyContent: 'center' }} onClick={() => navigate('/my-tickets')}>
                View My Tickets
              </button>
              <button className="btn btn-outline" style={{ justifyContent: 'center' }} onClick={() => navigate('/events')}>
                Browse More Events
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
