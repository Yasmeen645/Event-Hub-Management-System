package com.example.ticketservice.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_number", unique = true, nullable = false)
    private String ticketNumber;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "event_title", nullable = false)
    private String eventTitle;

    @Column(name = "event_date")
    private LocalDateTime eventDate;

    @Column(name = "event_location")
    private String eventLocation;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_username", nullable = false)
    private String userUsername;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    @Column(name = "payment_id")
    private String paymentId;

    @Column(name = "qr_code_data")
    private String qrCodeData;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Ticket() {}

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (ticketNumber == null) {
            ticketNumber = "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        if (status == null) status = TicketStatus.PENDING_PAYMENT;
        if (qrCodeData == null) qrCodeData = ticketNumber;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }

    public String getEventLocation() { return eventLocation; }
    public void setEventLocation(String eventLocation) { this.eventLocation = eventLocation; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserUsername() { return userUsername; }
    public void setUserUsername(String userUsername) { this.userUsername = userUsername; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getQrCodeData() { return qrCodeData; }
    public void setQrCodeData(String qrCodeData) { this.qrCodeData = qrCodeData; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long eventId;
        private String eventTitle;
        private LocalDateTime eventDate;
        private String eventLocation;
        private Long userId;
        private String userUsername;
        private BigDecimal price;
        private TicketStatus status;

        public Builder eventId(Long v) { this.eventId = v; return this; }
        public Builder eventTitle(String v) { this.eventTitle = v; return this; }
        public Builder eventDate(LocalDateTime v) { this.eventDate = v; return this; }
        public Builder eventLocation(String v) { this.eventLocation = v; return this; }
        public Builder userId(Long v) { this.userId = v; return this; }
        public Builder userUsername(String v) { this.userUsername = v; return this; }
        public Builder price(BigDecimal v) { this.price = v; return this; }
        public Builder status(TicketStatus v) { this.status = v; return this; }

        public Ticket build() {
            Ticket t = new Ticket();
            t.eventId = this.eventId;
            t.eventTitle = this.eventTitle;
            t.eventDate = this.eventDate;
            t.eventLocation = this.eventLocation;
            t.userId = this.userId;
            t.userUsername = this.userUsername;
            t.price = this.price;
            t.status = this.status;
            return t;
        }
    }

    public enum TicketStatus {
        PENDING_PAYMENT, PAID, CANCELLED
    }
}
