package com.example.notificationservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_username", nullable = false)
    private String recipientUsername;

    @Column(name = "recipient_email")
    private String recipientEmail;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(name = "is_read")
    private boolean read = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Notification() {}

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRecipientUsername() { return recipientUsername; }
    public void setRecipientUsername(String recipientUsername) { this.recipientUsername = recipientUsername; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String recipientUsername;
        private String recipientEmail;
        private String title;
        private String message;
        private NotificationType type;
        private boolean read = false;

        public Builder recipientUsername(String v) { this.recipientUsername = v; return this; }
        public Builder recipientEmail(String v) { this.recipientEmail = v; return this; }
        public Builder title(String v) { this.title = v; return this; }
        public Builder message(String v) { this.message = v; return this; }
        public Builder type(NotificationType v) { this.type = v; return this; }
        public Builder read(boolean v) { this.read = v; return this; }

        public Notification build() {
            Notification n = new Notification();
            n.recipientUsername = this.recipientUsername;
            n.recipientEmail = this.recipientEmail;
            n.title = this.title;
            n.message = this.message;
            n.type = this.type;
            n.read = this.read;
            return n;
        }
    }

    public enum NotificationType {
        BOOKING_CONFIRMED, EVENT_APPROVED, EVENT_REJECTED, EVENT_REMINDER, PAYMENT_RECEIVED, INFO
    }
}
