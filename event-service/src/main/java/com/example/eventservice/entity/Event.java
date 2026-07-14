package com.example.eventservice.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType type;

    @Column(nullable = false)
    private String location;

    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @Column(name = "total_tickets", nullable = false)
    private Integer totalTickets;

    @Column(name = "available_tickets", nullable = false)
    private Integer availableTickets;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status;

    @Column(name = "organizer_username", nullable = false)
    private String organizerUsername;

    @Column(name = "organizer_id")
    private Long organizerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "approved_by")
    private String approvedBy;

    public Event() {}

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = EventStatus.PENDING;
        if (availableTickets == null) availableTickets = totalTickets;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public EventType getType() { return type; }
    public void setType(EventType type) { this.type = type; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }

    public Integer getTotalTickets() { return totalTickets; }
    public void setTotalTickets(Integer totalTickets) { this.totalTickets = totalTickets; }

    public Integer getAvailableTickets() { return availableTickets; }
    public void setAvailableTickets(Integer availableTickets) { this.availableTickets = availableTickets; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }

    public String getOrganizerUsername() { return organizerUsername; }
    public void setOrganizerUsername(String organizerUsername) { this.organizerUsername = organizerUsername; }

    public Long getOrganizerId() { return organizerId; }
    public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String title;
        private String description;
        private EventType type;
        private String location;
        private LocalDateTime eventDate;
        private Integer totalTickets;
        private Integer availableTickets;
        private BigDecimal price;
        private String imageUrl;
        private EventStatus status;
        private String organizerUsername;
        private Long organizerId;

        public Builder title(String v) { this.title = v; return this; }
        public Builder description(String v) { this.description = v; return this; }
        public Builder type(EventType v) { this.type = v; return this; }
        public Builder location(String v) { this.location = v; return this; }
        public Builder eventDate(LocalDateTime v) { this.eventDate = v; return this; }
        public Builder totalTickets(Integer v) { this.totalTickets = v; return this; }
        public Builder availableTickets(Integer v) { this.availableTickets = v; return this; }
        public Builder price(BigDecimal v) { this.price = v; return this; }
        public Builder imageUrl(String v) { this.imageUrl = v; return this; }
        public Builder status(EventStatus v) { this.status = v; return this; }
        public Builder organizerUsername(String v) { this.organizerUsername = v; return this; }
        public Builder organizerId(Long v) { this.organizerId = v; return this; }

        public Event build() {
            Event e = new Event();
            e.title = this.title;
            e.description = this.description;
            e.type = this.type;
            e.location = this.location;
            e.eventDate = this.eventDate;
            e.totalTickets = this.totalTickets;
            e.availableTickets = this.availableTickets;
            e.price = this.price;
            e.imageUrl = this.imageUrl;
            e.status = this.status;
            e.organizerUsername = this.organizerUsername;
            e.organizerId = this.organizerId;
            return e;
        }
    }

    public enum EventType {
        CONCERT, CONFERENCE, WORKSHOP, SPORTS, ART, FOOD, TECH, NETWORKING, OTHER
    }

    public enum EventStatus {
        PENDING, APPROVED, REJECTED, CANCELLED
    }
}
