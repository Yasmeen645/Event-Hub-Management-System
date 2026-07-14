import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsApi } from '../services/api';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    ticketsApi.getMyTickets()
      .then(res => setTickets(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (ticket) => {
    setDownloading(ticket.id);
    try {
      const res = await ticketsApi.downloadPdf(ticket.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket_${ticket.ticketNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed. Ticket may not be paid yet.');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="page-header">
        <h1 className="page-title">My Tickets</h1>
        <p className="page-subtitle">All your booked events in one place</p>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎫</div>
          <h3>No tickets yet</h3>
          <p style={{ marginBottom: '1.5rem' }}>Book an event to see your tickets here</p>
          <button className="btn btn-primary" onClick={() => navigate('/events')}>
            Browse Events
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onDownload={handleDownload}
              downloading={downloading === ticket.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket, onDownload, downloading }) {
  const formattedDate = ticket.eventDate
    ? new Date(ticket.eventDate).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : 'TBD';

  return (
    <div className="ticket-card">
      <div className="ticket-card-left">
        <div className="ticket-number">{ticket.ticketNumber}</div>
        <div className="ticket-event-name">{ticket.eventTitle}</div>
        <div className="ticket-meta">
          📅 {formattedDate}
          {ticket.eventLocation && <span> &nbsp;·&nbsp; 📍 {ticket.eventLocation}</span>}
          <span> &nbsp;·&nbsp; 💰 ${ticket.price}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
        <span className={`badge badge-${ticket.status.toLowerCase().replace('_', '-')}`}>
          {ticket.status.replace('_', ' ')}
        </span>

        {ticket.status === 'PAID' && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onDownload(ticket)}
            disabled={downloading}
          >
            {downloading ? '...' : '📥 Download PDF'}
          </button>
        )}

        {ticket.status === 'PENDING_PAYMENT' && (
          <span style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>⚠️ Awaiting payment</span>
        )}
      </div>
    </div>
  );
}
